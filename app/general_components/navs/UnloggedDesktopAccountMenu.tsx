"use client";

import { FC, useEffect } from "react";
import { useRouter } from "next/navigation";

const LINKS: { label: string; href: string }[] = [
    { label: "Advertise", href: "/advertise" },
    { label: "Contact us", href: "/contact" },
    { label: "Login", href: "/auth/login" },
    { label: "Sign Up", href: "/auth/signup" },
];

type UnloggedDesktopAccountMenuProps = {
    open: boolean;
    onClose: () => void;
};

const BTN =
    "rounded-md px-3 py-2 text-center text-xs font-sans font-semibold uppercase tracking-wider text-gray-700 transition hover:bg-white hover:text-blue-950";

const UnloggedDesktopAccountMenu: FC<UnloggedDesktopAccountMenuProps> = ({ open, onClose }) => {
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
            id="unlogged-desktop-account-nav"
            className="hidden w-full border-b border-gray-200 bg-gray-50 lg:block"
            role="navigation"
            aria-label="Account and sign in"
        >
            <div className="flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:justify-end lg:px-12">
                {LINKS.map((item) => (
                    <button
                        key={item.href}
                        type="button"
                        className={BTN}
                        onClick={() => {
                            router.push(item.href);
                            onClose();
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default UnloggedDesktopAccountMenu;
