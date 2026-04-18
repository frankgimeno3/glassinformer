"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, useCallback, useEffect, useState } from "react";

const SUMMARY_API = "/api/v1/users/me/notifications/summary";

type NotificationsNavButtonProps = {
    /** Extra classes for the link (e.g. full-width mobile row). */
    className?: string;
};

const NotificationsNavButton: FC<NotificationsNavButtonProps> = ({ className = "" }) => {
    const [pendingCount, setPendingCount] = useState<number | null>(null);
    const pathname = usePathname();

    const load = useCallback(async () => {
        try {
            const res = await fetch(SUMMARY_API, { credentials: "include" });
            if (!res.ok) {
                setPendingCount(0);
                return;
            }
            const data = (await res.json()) as { pendingCount?: number };
            setPendingCount(typeof data.pendingCount === "number" ? data.pendingCount : 0);
        } catch {
            setPendingCount(0);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load, pathname]);

    useEffect(() => {
        const id = window.setInterval(() => void load(), 45_000);
        return () => window.clearInterval(id);
    }, [load]);

    useEffect(() => {
        const onCustom = () => void load();
        window.addEventListener("plynium-notifications-changed", onCustom);
        return () => window.removeEventListener("plynium-notifications-changed", onCustom);
    }, [load]);

    const badge =
        pendingCount != null && pendingCount > 0 ? (
            <span
                className="pointer-events-none absolute bottom-0 right-0 flex min-h-[1.15rem] min-w-[1.15rem] translate-x-1/4 translate-y-1/4 items-center justify-center rounded-full bg-red-600 px-1 text-[0.65rem] font-bold leading-none text-white shadow-sm"
                aria-hidden
            >
                {pendingCount > 99 ? "99+" : pendingCount}
            </span>
        ) : null;

    return (
        <Link
            href="/logged/notifications"
            className={`relative inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-sans font-semibold uppercase tracking-wider text-gray-700 shadow-sm transition hover:bg-gray-50 ${className}`}
        >
            <span>NOTIFICATIONS</span>
            {badge}
        </Link>
    );
};

export default NotificationsNavButton;
