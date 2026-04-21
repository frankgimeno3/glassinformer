"use client";

import { FC, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthenticationService from "@/apiClient/AuthenticationService";
import { syncOAuthProfileFromSession } from "@/apiClient/ProfileUserService";
import apiClient from "@/app/apiClient";
import {
    AUTH_AUX_TEXT,
    AUTH_CARD,
    AUTH_FORM,
    AUTH_PAGE_SHELL,
    AUTH_TEXT,
    AUTH_TITLE,
} from "../_components/authFormStyles";
import { GoogleOAuthFallbackLink } from "../_components/GoogleOAuthSection";

function mapCognitoOAuthQueryError(code: string | null, description: string | null): string {
    const desc = (description || "").toLowerCase();
    if (code === "access_denied") {
        return "Has cancelado el acceso con Google.";
    }
    if (code === "redirect_mismatch") {
        return "La URL de retorno no coincide con las «Callback URLs» del cliente de Cognito (redirect_mismatch).";
    }
    if (desc.includes("account") || code === "invalid_grant") {
        return "No se ha podido validar la cuenta con Google o con Cognito. Si ya tienes cuenta con email y contraseña, usa el acceso tradicional.";
    }
    return `Google no ha podido completar el acceso (${code || "error"}). Vuelve a intentarlo.`;
}

const OAuthCallbackInner: FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [fatal, setFatal] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("Completando inicio de sesión…");

    useEffect(() => {
        const err = searchParams.get("error");
        const errDesc = searchParams.get("error_description");
        if (err) {
            setFatal(mapCognitoOAuthQueryError(err, errDesc));
            return;
        }

        let cancelled = false;
        const deadline = Date.now() + 20000;

        (async () => {
            AuthenticationService.ensureAmplifyConfigured();
            AuthenticationService.ensureBrowserCookieStorage();

            while (!cancelled && Date.now() < deadline) {
                try {
                    await AuthenticationService.finishGoogleRedirectAndSyncSession();
                    const intent = sessionStorage.getItem("oauth_intent") || "login";
                    const redirRaw = sessionStorage.getItem("oauth_post_login_redirect");
                    const safeRedirect = redirRaw && redirRaw.startsWith("/") ? redirRaw : "/logged";

                    if (intent === "signup") {
                        sessionStorage.removeItem("oauth_intent");
                        sessionStorage.removeItem("oauth_signup_newsletter");
                        sessionStorage.removeItem("oauth_post_login_redirect");
                        router.replace(
                            `/auth/signup/oauth-finish?redirect=${encodeURIComponent(safeRedirect)}`
                        );
                        return;
                    }

                    sessionStorage.removeItem("oauth_intent");
                    const subscribe = sessionStorage.getItem("oauth_signup_newsletter") === "1";
                    sessionStorage.removeItem("oauth_signup_newsletter");
                    setStatus("Sincronizando tu perfil…");
                    await syncOAuthProfileFromSession({ subscribePortalNewsletter: subscribe });
                    try {
                        await apiClient.post("/api/v1/users/me/portal-feed-sync", {});
                    } catch {
                        /* best-effort */
                    }
                    sessionStorage.removeItem("oauth_post_login_redirect");
                    router.replace(safeRedirect);
                    return;
                } catch {
                    await new Promise((r) => setTimeout(r, 300));
                }
            }
            if (!cancelled) {
                setFatal(
                    "No se pudo completar el inicio de sesión con Google. Vuelve a la página de acceso e inténtalo de nuevo."
                );
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [router, searchParams]);

    if (fatal) {
        return (
            <div className={AUTH_PAGE_SHELL}>
                <div className={`${AUTH_CARD} ${AUTH_FORM}`}>
                    <h2 className={AUTH_TITLE}>Google</h2>
                    <p className={`${AUTH_TEXT} text-red-400`}>{fatal}</p>
                    <p className={AUTH_AUX_TEXT}>
                        Si ya tienes cuenta creada solo con email, usa el formulario de acceso con contraseña.
                    </p>
                    <GoogleOAuthFallbackLink href="/auth/login" label="Volver a iniciar sesión" />
                </div>
            </div>
        );
    }

    return (
        <div className={AUTH_PAGE_SHELL}>
            <div className={`${AUTH_CARD} ${AUTH_FORM}`}>
                <h2 className={AUTH_TITLE}>Google</h2>
                <p className={AUTH_TEXT}>{status}</p>
            </div>
        </div>
    );
};

const OAuthFallback = () => (
    <div className={AUTH_PAGE_SHELL}>
        <div className={`${AUTH_CARD} ${AUTH_FORM}`}>
            <p className={AUTH_TEXT}>Cargando…</p>
        </div>
    </div>
);

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={<OAuthFallback />}>
            <OAuthCallbackInner />
        </Suspense>
    );
}
