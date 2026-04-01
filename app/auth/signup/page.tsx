"use client";

import React, { FC, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthenticationService from "@/apiClient/AuthenticationService";
import { createProfileUser } from "@/apiClient/ProfileUserService";
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
} from "../_components/authFormStyles";

interface SignupProps {}

const SignupContent: FC<SignupProps> = ({}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectParam = searchParams.get("redirect");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    const [pendingEmail, setPendingEmail] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        try {
            await AuthenticationService.signUp(email.trim(), password);
            try {
                await createProfileUser(email.trim());
            } catch (rdsErr: any) {
                console.warn("Profile user creation failed (Cognito signup succeeded):", rdsErr);
            }
            setPendingEmail(email.trim());
            setSuccess(true);
        } catch (e: any) {
            console.error(e);
            const msg =
                e?.message ||
                e?.toString?.() ||
                "Sign-up failed. Please check your email and password.";
            setError(msg);
        }
    };

    if (success && pendingEmail) {
        return (
            <div className={AUTH_PAGE_SHELL}>
                <div className={`${AUTH_CARD} ${AUTH_FORM}`}>
                    <h2 className={AUTH_TITLE}>
                        Check your inbox
                    </h2>
                    <p className={AUTH_TEXT}>
                        We have sent a verification email to <strong className="text-white">{pendingEmail}</strong>.
                        Open the link or enter the code on the confirmation page to activate your account.
                    </p>
                    <a
                        href={redirectParam ? `/auth/confirm?email=${encodeURIComponent(pendingEmail)}&redirect=${encodeURIComponent(redirectParam)}` : `/auth/confirm?email=${encodeURIComponent(pendingEmail)}`}
                        className={`${AUTH_PRIMARY_BUTTON} text-center`}
                    >
                        Confirm account
                    </a>
                    <p className={AUTH_AUX_TEXT}>
                        Already confirmed?{" "}
                        <a href={redirectParam ? `/auth/login?redirect=${encodeURIComponent(redirectParam)}` : "/auth/login"} className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer">
                            Log in
                        </a>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={AUTH_PAGE_SHELL}>
            <form
                onSubmit={handleSignup}
                className={`${AUTH_CARD} ${AUTH_FORM}`}
            >
                <h2 className={AUTH_TITLE}>
                    Create an account
                </h2>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={AUTH_INPUT}
                    required
                />

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${AUTH_INPUT} pr-12`}
                        required
                        minLength={8}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={AUTH_ICON_BUTTON}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${AUTH_INPUT} pr-12`}
                        required
                        minLength={8}
                    />
                </div>

                {error && (
                    <div className={AUTH_ERROR}>
                        <p>ERROR:</p>
                        <p>{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className={AUTH_PRIMARY_BUTTON}
                >
                    Sign up
                </button>

                <p className={AUTH_AUX_TEXT}>
                    Already have an account?{" "}
                    <a href={redirectParam ? `/auth/login?redirect=${encodeURIComponent(redirectParam)}` : "/auth/login"} className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1">
                        Log in
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

export default function SignupPage() {
    return (
        <Suspense fallback={<FallbackForm />}>
            <SignupContent />
        </Suspense>
    );
}
