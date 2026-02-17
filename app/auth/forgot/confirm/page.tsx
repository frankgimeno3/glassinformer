"use client";

import React, { FC, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthenticationService from "@/apiClient/AuthenticationService";

interface ForgotConfirmProps {}

const ForgotConfirm: FC<ForgotConfirmProps> = ({}) => {
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
            setError("Introduce tu email.");
            return;
        }
        if (!code.trim()) {
            setError("Introduce el código que te hemos enviado por email.");
            return;
        }
        if (newPassword.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
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
                    "Error al restablecer la contraseña. Comprueba el código (puede haber expirado) e inténtalo de nuevo."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col bg-white items-center justify-center min-h-screen">
            <form
                onSubmit={handleConfirm}
                className="flex flex-col gap-4 bg-gray-900 p-8 rounded shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl text-white font-semibold mb-4 text-center">
                    Nueva contraseña
                </h2>
                <p className="text-gray-300 text-sm text-center">
                    Introduce el código que te hemos enviado por email y tu nueva
                    contraseña.
                </p>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2 rounded bg-black border border-gray-700 text-white placeholder-gray-400"
                    required
                />

                <input
                    type="text"
                    placeholder="Código de verificación"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="p-2 rounded bg-black border border-gray-700 text-white placeholder-gray-400"
                    required
                    autoComplete="one-time-code"
                />

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="p-2 rounded bg-black border border-gray-700 text-white placeholder-gray-400 w-full pr-10"
                        required
                        minLength={8}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-200"
                        tabIndex={-1}
                        aria-label={
                            showPassword
                                ? "Ocultar contraseña"
                                : "Mostrar contraseña"
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
                    placeholder="Confirmar nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="p-2 rounded bg-black border border-gray-700 text-white placeholder-gray-400 w-full"
                    required
                    minLength={8}
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
                    {loading ? "Guardando…" : "Restablecer contraseña"}
                </button>

                <p className="text-xs text-white text-center">
                    <a
                        href="/auth/login"
                        className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                        Volver a iniciar sesión
                    </a>
                </p>
            </form>
        </div>
    );
};

export default ForgotConfirm;
