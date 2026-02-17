"use client";

import React, { FC, useState } from "react";
import { useRouter } from "next/navigation";
import AuthenticationService from "@/apiClient/AuthenticationService";
import { createProfileUser } from "@/apiClient/ProfileUserService";

interface SignupProps {}

const Signup: FC<SignupProps> = ({}) => {
    const router = useRouter();
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
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
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
                "Error al registrarse. Comprueba el email y la contraseña.";
            setError(msg);
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
                        Te hemos enviado un correo de verificación a <strong className="text-white">{pendingEmail}</strong>.
                        Abre el enlace o introduce el código en la página de confirmación para activar tu cuenta.
                    </p>
                    <a
                        href={`/auth/confirm?email=${encodeURIComponent(pendingEmail)}`}
                        className="bg-white text-black py-2 rounded hover:bg-gray-300 transition cursor-pointer text-center font-medium"
                    >
                        Confirmar cuenta
                    </a>
                    <p className="text-xs text-white text-center">
                        ¿Ya confirmaste?{" "}
                        <a href="/auth/login" className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer">
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
                onSubmit={handleSignup}
                className="flex flex-col gap-4 bg-gray-900 p-8 rounded shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl text-white font-semibold mb-4 text-center">
                    Create an account
                </h2>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2 rounded bg-black border border-gray-700 text-white placeholder-gray-400"
                    required
                />

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 rounded bg-black border border-gray-700 text-white placeholder-gray-400 w-full pr-10"
                        required
                        minLength={8}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-200"
                        tabIndex={-1}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
                        className="p-2 rounded bg-black border border-gray-700 text-white placeholder-gray-400 w-full pr-10"
                        required
                        minLength={8}
                    />
                </div>

                {error && (
                    <div className="flex flex-col text-red-500 text-sm text-center">
                        <p>ERROR:</p>
                        <p>{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className="bg-white text-black py-2 rounded hover:bg-gray-300 transition cursor-pointer"
                >
                    Sign up
                </button>

                <p className="text-xs text-white">
                    Already have an account?{" "}
                    <a href="/auth/login" className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1">
                        Log in
                    </a>
                </p>
            </form>
        </div>
    );
};

export default Signup;
