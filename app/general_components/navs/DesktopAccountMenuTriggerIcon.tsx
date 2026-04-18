"use client";

import { FC } from "react";

/** User silhouette + chevron; chevron points up when `open`. */
const DesktopAccountMenuTriggerIcon: FC<{ open: boolean }> = ({ open }) => (
    <span className="inline-flex items-center gap-1.5" aria-hidden>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5.5 20.5v0c0-3.5 3-6.5 6.5-6.5s6.5 3 6.5 6.5" />
        </svg>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 12 12"
            className={`origin-center shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
            <path d="M6 9 L1 3 h10 L6 9 z" fill="currentColor" />
        </svg>
    </span>
);

export default DesktopAccountMenuTriggerIcon;
