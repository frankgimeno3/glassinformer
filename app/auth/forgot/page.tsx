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
import Reveal from "@/app/general_components/motion/Reveal";

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
                    <Reveal delayMs={0}>
                        <h2 className={AUTH_TITLE}>
                            Check your inbox
                        </h2>
                    </Reveal>
                    <Reveal delayMs={120}>
                        <p className={AUTH_TEXT}>
                            We have sent a reset code to{" "}
                            <strong className="text-gray-900">{pendingEmail}</strong>.
                            Enter the code and your new password on the next page.
                        </p>
                    </Reveal>
                    <Reveal delayMs={180}>
                        <a
                            href={`/auth/forgot/confirm?email=${encodeURIComponent(pendingEmail)}`}
                            className={`${AUTH_PRIMARY_BUTTON} text-center`}
                        >
                            Enter code and new password
                        </a>
                    </Reveal>
                    <Reveal delayMs={240}>
                        <p className={AUTH_AUX_TEXT}>
                            Remembered your password?{" "}
                            <a
                                href="/auth/login"
                                className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                            >
                                Log in
                            </a>
                        </p>
                    </Reveal>
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
                <Reveal delayMs={0}>
                    <h2 className={AUTH_TITLE}>
                        I forgot my password
                    </h2>
                </Reveal>

                <Reveal delayMs={120}>
                    <p className={AUTH_TEXT}>
                        Enter your email and we will send you a code to reset your password.
                    </p>
                </Reveal>

                <Reveal delayMs={180}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={AUTH_INPUT}
                        required
                    />
                </Reveal>

                {error && (
                    <Reveal delayMs={220}>
                        <div className={AUTH_ERROR}>
                            <p>{error}</p>
                        </div>
                    </Reveal>
                )}

                <Reveal delayMs={260}>
                    <button
                        type="submit"
                        disabled={loading}
                        className={AUTH_PRIMARY_BUTTON}
                    >
                        {loading ? "Sending…" : "Send code"}
                    </button>
                </Reveal>

                <Reveal delayMs={320}>
                    <p className={AUTH_AUX_TEXT}>
                        Remembered your password?{" "}
                        <a
                            href="/auth/login"
                            className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1"
                        >
                            Log in
                        </a>
                    </p>
                </Reveal>
            </form>
        </div>
    );
};

export default Forgot;
