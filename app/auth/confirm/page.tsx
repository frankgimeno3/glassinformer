"use client";

import React, { FC, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthenticationService from "@/apiClient/AuthenticationService";
import {
    AUTH_AUX_TEXT,
    AUTH_CARD,
    AUTH_ERROR,
    AUTH_FORM,
    AUTH_INPUT,
    AUTH_PAGE_SHELL,
    AUTH_PRIMARY_BUTTON,
    AUTH_SKELETON_CARD,
    AUTH_SKELETON_SHELL,
    AUTH_TEXT,
    AUTH_TITLE,
} from "../_components/authFormStyles";

interface ConfirmProps {}

const ConfirmContent: FC<ConfirmProps> = ({}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const redirectParam = searchParams.get("redirect");
    const loginUrl = redirectParam && redirectParam.startsWith("/")
        ? `/auth/login?confirmed=1&redirect=${encodeURIComponent(redirectParam)}`
        : "/auth/login?confirmed=1";

    useEffect(() => {
        const q = searchParams.get("email");
        if (q) setEmail(decodeURIComponent(q));
    }, [searchParams]);

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email.trim()) {
            setError("Enter your email.");
            return;
        }
        if (!code.trim()) {
            setError("Enter the verification code.");
            return;
        }
        setLoading(true);
        try {
            await AuthenticationService.confirmSignUp(email.trim(), code.trim());
            router.replace(loginUrl);
        } catch (e: any) {
            console.error(e);
            setError(e?.message || "Confirmation failed. Check the code and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={AUTH_PAGE_SHELL}>
            <form
                onSubmit={handleConfirm}
                className={`${AUTH_CARD} ${AUTH_FORM}`}
            >
                <h2 className={AUTH_TITLE}>
                    Confirm email
                </h2>
                <p className={AUTH_TEXT}>
                    Enter the code we sent to your email.
                </p>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={AUTH_INPUT}
                    required
                />

                <input
                    type="text"
                    placeholder="Verification code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={AUTH_INPUT}
                    required
                    autoComplete="one-time-code"
                />

                {error && (
                    <div className={AUTH_ERROR}>
                        <p>{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={AUTH_PRIMARY_BUTTON}
                >
                    {loading ? "Confirming…" : "Confirm account"}
                </button>

                <p className={AUTH_AUX_TEXT}>
                    <a href={loginUrl} className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer">
                        Back to login
                    </a>
                </p>
            </form>
        </div>
    );
};

export default function ConfirmPage() {
    return (
        <Suspense
            fallback={
                <div className={AUTH_SKELETON_SHELL}>
                    <div className={AUTH_SKELETON_CARD}>
                        <div className="h-8 bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
                        <div className="h-12 bg-gray-700 rounded animate-pulse" />
                        <div className="h-12 bg-gray-700 rounded animate-pulse" />
                    </div>
                </div>
            }
        >
            <ConfirmContent />
        </Suspense>
    );
}
