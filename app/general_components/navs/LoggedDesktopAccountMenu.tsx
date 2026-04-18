"use client";

import { FC, useEffect } from "react";
import { useRouter } from "next/navigation";

const ACCOUNT_LINKS: { textContent: string; urlRedirection: string }[] = [
    { textContent: "My Companies", urlRedirection: "/logged/companies" },
    { textContent: "My Profile", urlRedirection: "/logged/profiles/me" },
    { textContent: "Settings", urlRedirection: "/logged/settings" },
];

type LoggedDesktopAccountMenuProps = {
    open: boolean;
    onClose: () => void;
};

const LINK =
    "rounded-md px-3 py-2 text-center text-xs font-sans font-semibold uppercase tracking-wider text-gray-700 transition hover:bg-white hover:text-blue-950";

const LoggedDesktopAccountMenu: FC<LoggedDesktopAccountMenuProps> = ({ open, onClose }) => {
    const router = useRouter();

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            id="logged-desktop-account-nav"
            className="hidden w-full border-b border-gray-200 bg-gray-50 lg:block"
            role="navigation"
            aria-label="Account links"
        >
            <div className="flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:justify-end lg:px-12">
                {ACCOUNT_LINKS.map((item) => (
                    <button
                        key={item.urlRedirection}
                        type="button"
                        className={LINK}
                        onClick={() => {
                            router.push(item.urlRedirection);
                            onClose();
                        }}
                    >
                        {item.textContent}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LoggedDesktopAccountMenu;
