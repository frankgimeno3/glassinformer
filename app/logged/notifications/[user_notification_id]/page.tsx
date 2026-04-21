"use client";

import { useParams, useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
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

    const detailUrl = useMemo(() => {
        if (!user_notification_id || typeof user_notification_id !== "string") return null;
        return `/api/v1/users/me/notifications/${encodeURIComponent(user_notification_id)}`;
    }, [user_notification_id]);

    const [row, setRow] = useState<NotificationRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusBusy, setStatusBusy] = useState(false);

    const setNotificationStatus = useCallback(
        async (next: "read" | "pending") => {
            if (!detailUrl) return;
            setStatusBusy(true);
            try {
                const res = await fetch(detailUrl, {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ notification_status: next }),
                });
                if (!res.ok) {
                    return;
                }
                const updated = (await res.json()) as NotificationRow;
                setRow(updated);
                window.dispatchEvent(new Event("plynium-notifications-changed"));
            } finally {
                setStatusBusy(false);
            }
        },
        [detailUrl]
    );

    const load = useCallback(async () => {
        if (!detailUrl) {
            setError("Invalid notification.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(detailUrl, { credentials: "include" });
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
                let fallback = "Could not load this notification.";
                try {
                    const errBody = (await res.json()) as { message?: string };
                    if (errBody?.message && typeof errBody.message === "string") {
                        fallback = errBody.message;
                    }
                } catch {
                    /* ignore */
                }
                setError(fallback);
                setRow(null);
                return;
            }
            const data = (await res.json()) as NotificationRow;
            setRow(data);

            const status = String(data.notification_status || "").toLowerCase();
            if (status === "pending") {
                await setNotificationStatus("read");
            }
        } catch {
            setError("Could not load this notification.");
            setRow(null);
        } finally {
            setLoading(false);
        }
    }, [detailUrl, setNotificationStatus]);

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
                            Status:{" "}
                            <span className="font-medium text-gray-700">
                                {String(row.notification_status || "").toLowerCase() === "pending"
                                    ? "Unread (pending)"
                                    : "Read"}
                            </span>
                            {row.portal_id != null && (
                                <>
                                    {" "}
                                    · Portal ID: <span className="font-medium text-gray-700">{row.portal_id}</span>
                                </>
                            )}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            {String(row.notification_status || "").toLowerCase() === "pending" ? (
                                <button
                                    type="button"
                                    disabled={statusBusy}
                                    onClick={() => void setNotificationStatus("read")}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {statusBusy ? "Updating…" : "Mark as read"}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={statusBusy}
                                    onClick={() => void setNotificationStatus("pending")}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {statusBusy ? "Updating…" : "Mark as unread"}
                                </button>
                            )}
                            <p className="text-xs text-gray-500">
                                Opening this page marks pending notifications as read. Use &quot;Mark as unread&quot; to
                                move it back to your pending list.
                            </p>
                        </div>
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
