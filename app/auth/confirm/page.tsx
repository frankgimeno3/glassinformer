"use client";

import React, { FC, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthenticationService from "@/apiClient/AuthenticationService";

interface ConfirmProps {}

const Confirm: FC<ConfirmProps> = ({}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
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
            setError("Introduce el código de verificación.");
            return;
        }
        setLoading(true);
        try {
            await AuthenticationService.confirmSignUp(email.trim(), code.trim());
            router.replace("/auth/login?confirmed=1");
        } catch (e: any) {
            console.error(e);
            setError(e?.message || "Error al confirmar. Comprueba el código y vuelve a intentarlo.");
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
                    Confirmar correo
                </h2>
                <p className="text-gray-300 text-sm text-center">
                    Introduce el código que te hemos enviado por email.
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
                    {loading ? "Confirmando…" : "Confirmar cuenta"}
                </button>

                <p className="text-xs text-white text-center">
                    <a href="/auth/login" className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer">
                        Volver a iniciar sesión
                    </a>
                </p>
            </form>
        </div>
    );
};

export default Confirm;
