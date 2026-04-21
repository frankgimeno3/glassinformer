"use client";

import { FC, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthenticationService from "@/apiClient/AuthenticationService";
import { syncOAuthProfileFromSession } from "@/apiClient/ProfileUserService";
import apiClient from "@/app/apiClient";
import {
    AUTH_AUX_TEXT,
    AUTH_CARD,
    AUTH_ERROR,
    AUTH_FORM,
    AUTH_PAGE_SHELL,
    AUTH_PRIMARY_BUTTON,
    AUTH_SKELETON_CARD,
    AUTH_SKELETON_SHELL,
    AUTH_TEXT,
    AUTH_TITLE,
} from "../../_components/authFormStyles";

const AUTH_SECONDARY_BUTTON =
    "rounded-lg border border-gray-600 px-4 py-3 text-base font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50";

const OauthFinishInner: FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectParam = searchParams.get("redirect");
    const afterFinish =
        redirectParam && redirectParam.startsWith("/") ? redirectParam : "/logged";

    const [sessionChecked, setSessionChecked] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
    const [acceptedLegal, setAcceptedLegal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const ok = await AuthenticationService.isAuthenticated();
                if (cancelled) return;
                setHasSession(ok);
            } catch {
                if (!cancelled) setHasSession(false);
            }
            if (!cancelled) {
                setSessionChecked(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!sessionChecked || hasSession) return;
        router.replace("/auth/signup");
    }, [sessionChecked, hasSession, router]);

    const handleFinish = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!acceptedLegal) {
            setError(
                "Debes aceptar los términos y condiciones y el tratamiento de datos para continuar."
            );
            return;
        }
        setIsSubmitting(true);
        try {
            await syncOAuthProfileFromSession({ subscribePortalNewsletter: subscribeNewsletter });
            try {
                await apiClient.post("/api/v1/users/me/portal-feed-sync", {});
            } catch {
                /* best-effort */
            }
            sessionStorage.removeItem("oauth_post_login_redirect");
            router.replace(afterFinish);
        } catch (e: unknown) {
            console.error(e);
            const msg =
                e && typeof e === "object" && "message" in e
                    ? String((e as { message?: string }).message)
                    : "No se ha podido completar el registro. Inténtalo de nuevo.";
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!sessionChecked) {
        return (
            <div className={AUTH_SKELETON_SHELL}>
                <div className={AUTH_SKELETON_CARD}>
                    <div className="h-8 bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
                </div>
            </div>
        );
    }

    if (!hasSession) {
        return null;
    }

    return (
        <div className={AUTH_PAGE_SHELL}>
            <form onSubmit={(ev) => void handleFinish(ev)} className={`${AUTH_CARD} ${AUTH_FORM}`}>
                <h2 className={AUTH_TITLE}>Completa tu cuenta</h2>
                <p className={`${AUTH_TEXT} text-left`}>
                    Has iniciado sesión con Google. Elige si quieres el boletín del portal (mismo paso que el registro
                    por email) y finaliza para entrar en la aplicación.
                </p>
                <p className={`${AUTH_TEXT} text-left text-xs text-gray-400`}>
                    Las cuentas nuevas también se enlazan a las listas de boletín por defecto de este portal. Si te das
                    de alta abajo, se añaden las listas <strong className="text-gray-300">main</strong> del portal en
                    la base de datos compartida.
                </p>
                <label
                    htmlFor="oauth-legal-accept"
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-700 bg-black/40 px-4 py-3 text-left text-sm text-gray-200"
                >
                    <input
                        id="oauth-legal-accept"
                        type="checkbox"
                        checked={acceptedLegal}
                        onChange={(e) => {
                            setAcceptedLegal(e.target.checked);
                            if (e.target.checked) setError(null);
                        }}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span>
                        He leído y acepto los{" "}
                        <a
                            href="/legal/legal-notice"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-indigo-400 underline hover:text-indigo-300"
                        >
                            términos y condiciones
                        </a>
                        , la{" "}
                        <a
                            href="/legal/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-indigo-400 underline hover:text-indigo-300"
                        >
                            política de privacidad
                        </a>{" "}
                        y el{" "}
                        <a
                            href="/legal/cookie-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-indigo-400 underline hover:text-indigo-300"
                        >
                            tratamiento de datos y cookies
                        </a>{" "}
                        de este portal.
                    </span>
                </label>
                <label
                    htmlFor="oauth-newsletter-opt-in"
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-700 bg-black/40 px-4 py-3 text-left text-sm text-gray-200"
                >
                    <input
                        id="oauth-newsletter-opt-in"
                        type="checkbox"
                        checked={subscribeNewsletter}
                        onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span>
                        Sí, quiero suscribirme al boletín del portal y recibir por email las noticias más destacadas.
                    </span>
                </label>
                {error && (
                    <div className={AUTH_ERROR}>
                        <p>{error}</p>
                    </div>
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <button
                        type="button"
                        className={AUTH_SECONDARY_BUTTON}
                        disabled={isSubmitting}
                        onClick={() => router.push("/auth/signup")}
                    >
                        Volver
                    </button>
                    <button
                        type="submit"
                        className={AUTH_PRIMARY_BUTTON}
                        disabled={isSubmitting || !acceptedLegal}
                    >
                        {isSubmitting ? "Guardando…" : "Finalizar y entrar"}
                    </button>
                </div>
                <p className={AUTH_AUX_TEXT}>
                    ¿Ya tenías cuenta?{" "}
                    <a
                        href="/auth/login"
                        className="font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                        Iniciar sesión
                    </a>
                </p>
            </form>
        </div>
    );
};

const Fallback = () => (
    <div className={AUTH_SKELETON_SHELL}>
        <div className={AUTH_SKELETON_CARD}>
            <div className="h-8 bg-gray-700 rounded animate-pulse" />
        </div>
    </div>
);

export default function SignupOauthFinishPage() {
    return (
        <Suspense fallback={<Fallback />}>
            <OauthFinishInner />
        </Suspense>
    );
}
