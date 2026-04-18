"use client";

import { useParams, useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useState } from "react";
import type { NotificationRow } from "../page";

function formatDate(iso: string | null) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString(undefined, {
            weekday: "long",
            dateStyle: "medium",
            timeStyle: "short",
        });
    } catch {
        return iso;
    }
}

const NotificationDetailPage: FC = () => {
    const params = useParams();
    const router = useRouter();
    const rawId = params?.user_notification_id;
    const user_notification_id = Array.isArray(rawId) ? rawId[0] : rawId;

    const [row, setRow] = useState<NotificationRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!user_notification_id || typeof user_notification_id !== "string") {
            setError("Invalid notification.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const url = `/api/v1/users/me/notifications/${encodeURIComponent(user_notification_id)}`;
            const res = await fetch(url, { credentials: "include" });
            if (res.status === 401) {
                setError("You need to be logged in.");
                setRow(null);
                return;
            }
            if (res.status === 404) {
                setError("Notification not found.");
                setRow(null);
                return;
            }
            if (!res.ok) {
                setError("Could not load this notification.");
                setRow(null);
                return;
            }
            const data = (await res.json()) as NotificationRow;
            setRow(data);

            const status = String(data.notification_status || "").toLowerCase();
            if (status === "pending") {
                await fetch(url, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: "{}" });
                window.dispatchEvent(new Event("plynium-notifications-changed"));
                const refreshed = await fetch(url, { credentials: "include" });
                if (refreshed.ok) {
                    setRow((await refreshed.json()) as NotificationRow);
                }
            }
        } catch {
            setError("Could not load this notification.");
            setRow(null);
        } finally {
            setLoading(false);
        }
    }, [user_notification_id]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <div className="mx-auto max-w-2xl pb-16">
            <button
                type="button"
                onClick={() => router.push("/logged/notifications")}
                className="mb-6 text-sm font-semibold uppercase tracking-wider text-blue-950 hover:underline"
            >
                ← Back to notifications
            </button>

            {loading && <p className="text-gray-500">Loading…</p>}
            {error && <p className="text-red-700">{error}</p>}

            {!loading && !error && row && (
                <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <header className="border-b border-gray-100 pb-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-950">
                            {row.notification_type || "Notification"}
                        </p>
                        <p className="mt-2 text-sm text-gray-400">{formatDate(row.notification_date)}</p>
                        <p className="mt-1 text-xs text-gray-400">
                            Status: <span className="font-medium text-gray-700">{row.notification_status}</span>
                            {row.portal_id != null && (
                                <>
                                    {" "}
                                    · Portal ID: <span className="font-medium text-gray-700">{row.portal_id}</span>
                                </>
                            )}
                        </p>
                    </header>
                    <div className="prose prose-gray mt-6 max-w-none">
                        <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-900">
                            {row.notification_content}
                        </p>
                    </div>
                    {row.notification_redirection ? (
                        <p className="mt-8">
                            <a
                                href={row.notification_redirection}
                                className="text-sm font-semibold text-blue-950 underline hover:text-blue-900"
                            >
                                Open link
                            </a>
                        </p>
                    ) : null}
                </article>
            )}
        </div>
    );
};

export default NotificationDetailPage;
