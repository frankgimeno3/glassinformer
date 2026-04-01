"use client";

import React, { FC, useState } from "react";
import AuthenticationService from "@/apiClient/AuthenticationService";
import {
    AUTH_AUX_TEXT,
    AUTH_CARD,
    AUTH_ERROR,
    AUTH_FORM,
    AUTH_INPUT,
    AUTH_PAGE_SHELL,
    AUTH_PRIMARY_BUTTON,
    AUTH_TEXT,
    AUTH_TITLE,
} from "../_components/authFormStyles";

interface ForgotProps {}

const Forgot: FC<ForgotProps> = ({}) => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [pendingEmail, setPendingEmail] = useState<string | null>(null);

    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            setLoading(true);
            await AuthenticationService.resetPassword(email.trim());
            setPendingEmail(email.trim());
            setSuccess(true);
        } catch (e: any) {
            console.error(e);
            setError(
                e?.message ||
                    "No se pudo enviar el enlace. Comprueba el email o que la cuenta exista."
            );
        } finally {
            setLoading(false);
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
                        We have sent a reset code to{" "}
                        <strong className="text-white">{pendingEmail}</strong>.
                        Enter the code and your new password on the next page.
                    </p>
                    <a
                        href={`/auth/forgot/confirm?email=${encodeURIComponent(pendingEmail)}`}
                        className={`${AUTH_PRIMARY_BUTTON} text-center`}
                    >
                        Enter code and new password
                    </a>
                    <p className={AUTH_AUX_TEXT}>
                        Remembered your password?{" "}
                        <a
                            href="/auth/login"
                            className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                        >
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
                onSubmit={handleForgot}
                className={`${AUTH_CARD} ${AUTH_FORM}`}
            >
                <h2 className={AUTH_TITLE}>
                    I forgot my password
                </h2>

                <p className={AUTH_TEXT}>
                    Enter your email and we will send you a code to reset your password.
                </p>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={AUTH_INPUT}
                    required
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
                    {loading ? "Sending…" : "Send code"}
                </button>

                <p className={AUTH_AUX_TEXT}>
                    Remembered your password?{" "}
                    <a
                        href="/auth/login"
                        className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1"
                    >
                        Log in
                    </a>
                </p>
            </form>
        </div>
    );
};

export default Forgot;
