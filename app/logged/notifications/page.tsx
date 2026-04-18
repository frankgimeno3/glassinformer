"use client";

import Link from "next/link";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

const LIST_API = "/api/v1/users/me/notifications";

export type NotificationRow = {
    user_notification_id: string;
    notification_type: string;
    notification_content: string;
    notification_date: string | null;
    notification_status: string;
    notification_redirection: string | null;
    portal_id: number | null;
};

function formatDate(iso: string | null) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
    } catch {
        return iso;
    }
}

const NotificationsPage: FC = () => {
    const [tab, setTab] = useState<"pending" | "read">("pending");
    const [items, setItems] = useState<NotificationRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(LIST_API, { credentials: "include" });
            if (res.status === 401) {
                setError("You need to be logged in to view notifications.");
                setItems([]);
                return;
            }
            if (!res.ok) {
                setError("Could not load notifications.");
                setItems([]);
                return;
            }
            const data = (await res.json()) as { notifications?: NotificationRow[] };
            setItems(Array.isArray(data.notifications) ? data.notifications : []);
        } catch {
            setError("Could not load notifications.");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const pendingList = useMemo(
        () => items.filter((n) => String(n.notification_status).toLowerCase() === "pending"),
        [items]
    );
    const readList = useMemo(
        () => items.filter((n) => String(n.notification_status).toLowerCase() !== "pending"),
        [items]
    );

    const visible = tab === "pending" ? pendingList : readList;

    const tabBtn = (id: "pending" | "read", label: string) => (
        <button
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 border-b-2 py-3 text-center text-sm font-semibold uppercase tracking-wider transition ${
                tab === id
                    ? "border-blue-950 text-blue-950"
                    : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="mx-auto max-w-3xl pb-16">
            <h1 className="mb-6 font-serif text-3xl font-bold tracking-tight text-gray-900">Notifications</h1>

            <div className="mb-6 flex border-b border-gray-200">
                {tabBtn("pending", "Pending")}
                {tabBtn("read", "Read")}
            </div>

            {loading && <p className="text-gray-500">Loading…</p>}
            {error && <p className="text-red-700">{error}</p>}

            {!loading && !error && visible.length === 0 && (
                <p className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-gray-500">
                    {tab === "pending" ? "No pending notifications." : "No read notifications yet."}
                </p>
            )}

            {!loading && !error && visible.length > 0 && (
                <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    {visible.map((n) => (
                        <li key={n.user_notification_id}>
                            <Link
                                href={`/logged/notifications/${n.user_notification_id}`}
                                className="block cursor-pointer px-4 py-4 transition hover:bg-gray-50"
                            >
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-950">
                                        {n.notification_type || "Notification"}
                                    </span>
                                    <span className="text-xs text-gray-400">{formatDate(n.notification_date)}</span>
                                </div>
                                <p className="mt-2 line-clamp-2 text-sm text-gray-800">{n.notification_content}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationsPage;
