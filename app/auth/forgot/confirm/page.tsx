"use client";

import React, { FC, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthenticationService from "@/apiClient/AuthenticationService";
import {
    AUTH_AUX_TEXT,
    AUTH_CARD,
    AUTH_ERROR,
    AUTH_FORM,
    AUTH_ICON_BUTTON,
    AUTH_INPUT,
    AUTH_PAGE_SHELL,
    AUTH_PRIMARY_BUTTON,
    AUTH_SKELETON_CARD,
    AUTH_SKELETON_SHELL,
    AUTH_TEXT,
    AUTH_TITLE,
} from "../../_components/authFormStyles";

interface ForgotConfirmProps {}

const ForgotConfirmContent: FC<ForgotConfirmProps> = ({}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
            setError("Enter the code we sent to your email.");
            return;
        }
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await AuthenticationService.confirmResetPassword(
                email.trim(),
                code.trim(),
                newPassword
            );
            router.replace("/auth/login?reset=1");
        } catch (e: any) {
            console.error(e);
            setError(
                e?.message ||
                    "Password reset failed. Check the code, which may have expired, and try again."
            );
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
                    New password
                </h2>
                <p className={AUTH_TEXT}>
                    Enter the code we sent to your email and your new password.
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

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`${AUTH_INPUT} pr-12`}
                        required
                        minLength={8}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={AUTH_ICON_BUTTON}
                        tabIndex={-1}
                        aria-label={
                            showPassword
                                ? "Hide password"
                                : "Show password"
                        }
                    >
                        {showPassword ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 cursor-pointer"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 cursor-pointer"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        )}
                    </button>
                </div>

                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={AUTH_INPUT}
                    required
                    minLength={8}
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
                    {loading ? "Saving…" : "Reset password"}
                </button>

                <p className={AUTH_AUX_TEXT}>
                    <a
                        href="/auth/login"
                        className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                        Back to login
                    </a>
                </p>
            </form>
        </div>
    );
};

const FallbackForm = () => (
    <div className={AUTH_SKELETON_SHELL}>
        <div className={AUTH_SKELETON_CARD}>
            <div className="h-8 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
            <div className="h-12 bg-gray-700 rounded animate-pulse" />
            <div className="h-12 bg-gray-700 rounded animate-pulse" />
        </div>
    </div>
);

export default function ForgotConfirmPage() {
    return (
        <Suspense fallback={<FallbackForm />}>
            <ForgotConfirmContent />
        </Suspense>
    );
}
