"use client";

import React, { FC, useState } from "react";
import AuthenticationService from "@/apiClient/AuthenticationService";

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
            <div className="flex flex-col bg-white items-center justify-center min-h-screen">
                <div className="flex flex-col gap-4 bg-gray-900 p-8 rounded shadow-md w-full max-w-md">
                    <h2 className="text-2xl text-white font-semibold mb-4 text-center">
                        Revisa tu correo
                    </h2>
                    <p className="text-gray-300 text-center">
                        Te hemos enviado un código de restablecimiento a{" "}
                        <strong className="text-white">{pendingEmail}</strong>.
                        Introduce el código y tu nueva contraseña en la siguiente
                        página.
                    </p>
                    <a
                        href={`/auth/forgot/confirm?email=${encodeURIComponent(pendingEmail)}`}
                        className="bg-white text-black py-2 rounded hover:bg-gray-300 transition cursor-pointer text-center font-medium"
                    >
                        Introducir código y nueva contraseña
                    </a>
                    <p className="text-xs text-white text-center">
                        ¿Recordaste tu contraseña?{" "}
                        <a
                            href="/auth/login"
                            className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                        >
                            Iniciar sesión
                        </a>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-white items-center justify-center min-h-screen">
            <form
                onSubmit={handleForgot}
                className="flex flex-col gap-4 bg-gray-900 p-8 rounded shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl text-white font-semibold mb-4 text-center">
                    He olvidado mi contraseña
                </h2>

                <p className="text-sm text-gray-300 text-center mb-2">
                    Introduce tu email y te enviaremos un código para restablecer
                    tu contraseña.
                </p>

                <input
                    type="email"
                    placeholder="Introduce tu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2 rounded bg-black border border-gray-700 text-white placeholder-gray-400"
                    required
                />

                {error && (
                    <div className="flex flex-col text-red-500 text-sm text-center">
                        <p>{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-white text-black py-2 rounded hover:bg-gray-300 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Enviando…" : "Enviar código"}
                </button>

                <p className="text-xs text-white text-center">
                    ¿Recordaste tu contraseña?{" "}
                    <a
                        href="/auth/login"
                        className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1"
                    >
                        Iniciar sesión
                    </a>
                </p>
            </form>
        </div>
    );
};

export default Forgot;
