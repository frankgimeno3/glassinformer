"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getEmployeeCompanies, prefetchEmployeeCompanies } from "@/app/logged/companies/employeeCompaniesClient";

const ACCOUNT_LINKS_BASE: {
    key: "myProfile" | "myCompanies" | "settings" | "advertise";
    textContent: string;
    urlRedirection: string;
}[] = [
    { key: "myProfile", textContent: "My Profile", urlRedirection: "/logged/profiles/me" },
    { key: "myCompanies", textContent: "My Companies", urlRedirection: "/logged/companies" },
    { key: "settings", textContent: "Settings", urlRedirection: "/logged/settings" },
    { key: "advertise", textContent: "Advertise", urlRedirection: "/advertise" },
];

type LoggedDesktopAccountMenuProps = {
    open: boolean;
    onClose: () => void;
};

const LINK =
    "rounded-md px-3 py-2 text-center text-xs font-sans font-semibold uppercase tracking-wider text-gray-700 transition hover:bg-white hover:text-blue-950";

const LoggedDesktopAccountMenu: FC<LoggedDesktopAccountMenuProps> = ({ open, onClose }) => {
    const router = useRouter();
    const [hasActiveEmployeeCompanies, setHasActiveEmployeeCompanies] = useState<boolean>(false);

    useEffect(() => {
        prefetchEmployeeCompanies();
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await getEmployeeCompanies();
                const companies = Array.isArray(data?.companies) ? data.companies : [];
                if (!cancelled) setHasActiveEmployeeCompanies(companies.length > 0);
            } catch {
                if (!cancelled) setHasActiveEmployeeCompanies(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const accountLinks = useMemo(() => {
        return ACCOUNT_LINKS_BASE.filter((l) => {
            if (l.key === "myCompanies") return hasActiveEmployeeCompanies;
            return true;
        });
    }, [hasActiveEmployeeCompanies]);

    if (!open) return null;

    return (
        <div
            id="logged-desktop-account-nav"
            className="hidden w-full border-b border-gray-200 bg-gray-50 lg:block"
            role="navigation"
            aria-label="Account links"
        >
            <div className="flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:justify-end lg:px-12">
                {accountLinks.map((item) => (
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
