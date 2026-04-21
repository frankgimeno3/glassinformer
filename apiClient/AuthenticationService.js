/**
 * Google OAuth (Cognito Hosted UI) — variables recomendadas en `.env.local`:
 *
 * - NEXT_PUBLIC_USER_POOL_ID, NEXT_PUBLIC_USER_POOL_CLIENT_ID (ya usadas para email/password)
 * - NEXT_PUBLIC_COGNITO_REGION o NEXT_PUBLIC_USER_POOL_REGION (para componer el dominio Hosted UI)
 * - NEXT_PUBLIC_COGNITO_DOMAIN — prefijo del dominio (mismo que usa el servidor para refresh token),
 *   p. ej. `eu-west-1_xxxxx`, O bien NEXT_PUBLIC_COGNITO_OAUTH_DOMAIN con el host completo:
 *   `eu-west-1_xxxxx.auth.eu-west-1.amazoncognito.com`
 * - NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_IN — URL absoluta de esta app que coincide EXACTAMENTE con una
 *   "Callback URL" del cliente Cognito, p. ej. `http://localhost:3000/auth/oauth`
 *   (varias URLs: separadas por coma; en la consola AWS deben estar todas registradas)
 * - Opcional: NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_OUT — URLs de cierre de sesión Hosted UI
 * - Opcional: NEXT_PUBLIC_COGNITO_GOOGLE_IDENTITY_PROVIDER — nombre exacto del IdP en Cognito (por defecto `Google`).
 * - Managed login: si ves la pantalla intermedia «Sign in» de Cognito, pon
 *   NEXT_PUBLIC_COGNITO_OAUTH_USE_LOGIN_ENDPOINT=true (entrada GET /login?… misma query que /oauth2/authorize).
 *
 * En AWS Console: User Pool → Sign-in experience → Federated identity providers → Google;
 * App integration → Domain; App client → Hosted UI → OAuth 2.0 → callback/logout URLs.
 * No incluyas secretos de Google en el cliente: el Client Secret va solo en Cognito.
 */
import { Amplify } from "aws-amplify";
import { signIn, confirmSignIn, signOut } from "aws-amplify/auth/cognito";
import {
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  signInWithRedirect,
  getCurrentUser,
} from "aws-amplify/auth";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage, decodeJWT, fetchAuthSession } from "@aws-amplify/core";
import "@aws-amplify/auth/enable-oauth-listener";

/**
 * Dominio Hosted UI de Cognito (sin https), p. ej. my-prefix.auth.eu-west-1.amazoncognito.com
 * Opcional: NEXT_PUBLIC_COGNITO_OAUTH_DOMAIN explícito; si no, se compone con NEXT_PUBLIC_COGNITO_DOMAIN + región
 * (mismo patrón que en el servidor para oauth2/token).
 */
function getCognitoOAuthDomain() {
  const explicit = process.env.NEXT_PUBLIC_COGNITO_OAUTH_DOMAIN?.trim();
  if (explicit) {
    return explicit.replace(/^https?:\/\//i, "");
  }
  const prefix = process.env.NEXT_PUBLIC_COGNITO_DOMAIN?.trim() || process.env.NEXT_PUBLIC_USER_POOL_DOMAIN?.trim();
  const region =
    process.env.NEXT_PUBLIC_COGNITO_REGION?.trim() || process.env.NEXT_PUBLIC_USER_POOL_REGION?.trim();
  if (prefix && region && !prefix.includes("amazoncognito.com")) {
    return `${prefix}.auth.${region}.amazoncognito.com`;
  }
  if (prefix) {
    return prefix.replace(/^https?:\/\//i, "");
  }
  return "";
}

/** URLs absolutas separadas por coma; deben coincidir con Callback URL(s) en el cliente de Cognito. */
function parseOAuthUrlList(raw) {
  if (!raw || typeof raw !== "string") {
    return [];
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * true si Cognito Hosted UI + redirects están definidos (Google OAuth).
 * Requiere en consola AWS: Google como IdP y el mismo cliente con OAuth habilitado.
 */
function isGoogleOAuthConfiguredInner() {
  const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
  const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
  const domain = getCognitoOAuthDomain();
  const redirects = parseOAuthUrlList(process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_IN || "");
  return !!(userPoolId && userPoolClientId && domain && redirects.length > 0);
}

/**
 * Managed login: GET /login acepta los mismos parámetros que /oauth2/authorize (incl. identity_provider).
 */
function useCognitoLoginPathForGoogleOAuth() {
  const v = process.env.NEXT_PUBLIC_COGNITO_OAUTH_USE_LOGIN_ENDPOINT?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function googleIdentityProviderArg() {
  const custom = process.env.NEXT_PUBLIC_COGNITO_GOOGLE_IDENTITY_PROVIDER?.trim();
  return custom ? { custom: custom } : "Google";
}

function configureAmplify() {
  const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
  const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;

  // Only configure if env vars are available (skip during build if they're not set)
  if (!userPoolId || !userPoolClientId) {
    // During build time, env vars might not be available, so we'll configure later at runtime
    // This prevents build failures while still allowing runtime configuration
    return;
  }

  const oauthDomain = getCognitoOAuthDomain();
  const redirectSignIn = parseOAuthUrlList(process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_IN || "");
  const redirectSignOut = parseOAuthUrlList(
    process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_OUT || process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_IN || ""
  );

  const loginWith = {
    username: true,
  };

  if (oauthDomain && redirectSignIn.length > 0) {
    loginWith.oauth = {
      domain: oauthDomain,
      scopes: ["openid", "email", "profile"],
      redirectSignIn,
      redirectSignOut: redirectSignOut.length > 0 ? redirectSignOut : [...redirectSignIn],
      responseType: "code",
    };
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith,
      },
    },
  });
}

export default class AuthenticationService {
  static async login(username, password) {

    configureAmplify();

    // Verify configuration was successful before proceeding
    const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
    const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
    if (!userPoolId || !userPoolClientId) {
      throw new Error("Missing Cognito env vars: NEXT_PUBLIC_USER_POOL_ID and/or NEXT_PUBLIC_USER_POOL_CLIENT_ID");
    }

    cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());

    let session = await fetchAuthSession();
    let idTokenString = session.tokens?.idToken?.toString();
    if (idTokenString) {
      const { payload } = decodeJWT(idTokenString);
      if (typeof window !== "undefined" && username) {
        localStorage.setItem("username", username);
      }
      return payload;
    }

    let response;
    try {
      response = await signIn({
        username,
        password
      });
    } catch (err) {
      const alreadyAuthed =
        err?.name === "UserAlreadyAuthenticatedException" ||
        String(err?.message ?? "").includes("already a signed in user");
      if (alreadyAuthed) {
        session = await fetchAuthSession();
        idTokenString = session.tokens?.idToken?.toString();
        if (!idTokenString) {
          throw err;
        }
        const { payload } = decodeJWT(idTokenString);
        if (typeof window !== "undefined" && username) {
          localStorage.setItem("username", username);
        }
        return payload;
      }
      throw err;
    }

    if (response.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
      const newPassword = prompt("Por favor, introduzca nueva contraseña");
      if (!newPassword) {
        throw new Error("Nueva contraseña requerida.");
      }
      await confirmSignIn({
        challengeResponse: newPassword
      });
    }

    session = await fetchAuthSession();

    idTokenString = session.tokens?.idToken?.toString();
    if (!idTokenString) {
      throw new Error("Usuario no autenticado.");
    }

    const { payload } = decodeJWT(idTokenString);

    if (typeof window !== "undefined") {
      localStorage.setItem("username", username);
    }

    return payload;
  }

  /**
   * Returns whether the current user has a valid session (client-side only).
   * @returns {Promise<boolean>}
   */
  static async isAuthenticated() {
    try {
      configureAmplify();
      const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
      const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
      if (!userPoolId || !userPoolClientId) return false;
      if (typeof window === "undefined") return false;
      cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());
      const session = await fetchAuthSession();
      return !!(session?.tokens?.idToken);
    } catch {
      return false;
    }
  }

  static async logout() {
    configureAmplify();

    // Verify configuration was successful before proceeding
    const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
    const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
    if (!userPoolId || !userPoolClientId) {
      throw new Error("Missing Cognito env vars: NEXT_PUBLIC_USER_POOL_ID and/or NEXT_PUBLIC_USER_POOL_CLIENT_ID");
    }

    cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());

    if (typeof window !== "undefined") {
      localStorage.removeItem("username");
    }
    await signOut();
  }

  /**
   * Registra un nuevo usuario en Cognito. AWS enviará un correo de verificación.
   * El usuario debe confirmar con el código recibido (confirmSignUp).
   * @param {string} email - Email del usuario (usado como username en Cognito)
   * @param {string} password - Contraseña
   * @returns {Promise<{ isSignUpComplete: boolean, nextStep: object }>}
   */
  static async signUp(email, password) {
    configureAmplify();

    const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
    const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
    if (!userPoolId || !userPoolClientId) {
      throw new Error("Missing Cognito env vars: NEXT_PUBLIC_USER_POOL_ID and/or NEXT_PUBLIC_USER_POOL_CLIENT_ID");
    }

    const result = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
        },
      },
    });

    return result;
  }

  /**
   * Confirma el registro con el código enviado por email.
   * @param {string} email - Email (username) del usuario
   * @param {string} confirmationCode - Código recibido por correo
   */
  static async confirmSignUp(email, confirmationCode) {
    configureAmplify();

    const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
    const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
    if (!userPoolId || !userPoolClientId) {
      throw new Error("Missing Cognito env vars: NEXT_PUBLIC_USER_POOL_ID and/or NEXT_PUBLIC_USER_POOL_CLIENT_ID");
    }

    await confirmSignUp({
      username: email,
      confirmationCode,
    });
  }

  /**
   * Inicia el flujo "olvidé mi contraseña". Cognito envía un código al email del usuario.
   * @param {string} username - Email del usuario (username en Cognito)
   * @returns {Promise<{ nextStep: object }>}
   */
  static async resetPassword(username) {
    configureAmplify();

    const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
    const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
    if (!userPoolId || !userPoolClientId) {
      throw new Error("Missing Cognito env vars: NEXT_PUBLIC_USER_POOL_ID and/or NEXT_PUBLIC_USER_POOL_CLIENT_ID");
    }

    const output = await resetPassword({ username: username.trim() });
    return output;
  }

  /**
   * Confirma el restablecimiento de contraseña con el código recibido por email.
   * @param {string} username - Email del usuario
   * @param {string} confirmationCode - Código recibido por correo
   * @param {string} newPassword - Nueva contraseña
   */
  static async confirmResetPassword(username, confirmationCode, newPassword) {
    configureAmplify();

    const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
    const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
    if (!userPoolId || !userPoolClientId) {
      throw new Error("Missing Cognito env vars: NEXT_PUBLIC_USER_POOL_ID and/or NEXT_PUBLIC_USER_POOL_CLIENT_ID");
    }

    await confirmResetPassword({
      username: username.trim(),
      confirmationCode: confirmationCode.trim(),
      newPassword,
    });
  }

  static isGoogleOAuthConfigured() {
    return isGoogleOAuthConfiguredInner();
  }

  /** Idempotente: vuelve a aplicar Amplify.configure con la configuración actual (incl. OAuth si aplica). */
  static ensureAmplifyConfigured() {
    configureAmplify();
  }

  static ensureBrowserCookieStorage() {
    if (typeof window !== "undefined") {
      cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());
    }
  }

  /**
   * Inicia el flujo OAuth con Google (redirección a Hosted UI de Cognito).
   * Configura cookies de sesión al volver en la ruta indicada en NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_IN.
   */
  /**
   * @param {{ intent?: "login" | "signup" }} [options] — `signup` deja el alta RDS/newsletter para `/auth/signup/oauth-finish`.
   */
  static async startGoogleRedirectSignIn(options = {}) {
    configureAmplify();
    const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
    const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
    if (!userPoolId || !userPoolClientId) {
      throw new Error("Missing Cognito env vars: NEXT_PUBLIC_USER_POOL_ID and/or NEXT_PUBLIC_USER_POOL_CLIENT_ID");
    }
    if (!isGoogleOAuthConfiguredInner()) {
      throw new Error("GOOGLE_OAUTH_CONFIG_MISSING");
    }
    this.ensureBrowserCookieStorage();
    if (typeof window !== "undefined") {
      const intent = options.intent === "signup" ? "signup" : "login";
      sessionStorage.setItem("oauth_intent", intent);
    }
    const provider = googleIdentityProviderArg();
    const useLoginPath = useCognitoLoginPathForGoogleOAuth();
    if (useLoginPath && typeof window !== "undefined") {
      await signInWithRedirect({
        provider,
        options: {
          lang: "es",
          authSessionOpener: async (url) => {
            const mapped = url.includes("/oauth2/authorize")
              ? url.replace("/oauth2/authorize", "/login")
              : url;
            window.location.href = mapped.replace("http://", "https://");
          },
        },
      });
      return;
    }
    await signInWithRedirect({ provider, options: { lang: "es" } });
  }

  /**
   * Mensajes de error en español para UI (OAuth y cancelación).
   * @param {unknown} err
   * @returns {string}
   */
  static mapOAuthErrorToMessage(err) {
    const name = err && typeof err === "object" ? err.name : undefined;
    const message = String((err && typeof err === "object" && err.message) || err || "");
    const lower = message.toLowerCase();
    if (name === "OAuthSignInError" || lower.includes("canceled") || message.includes("canceled")) {
      return "Has cancelado el inicio de sesión con Google.";
    }
    if (lower.includes("popup") && lower.includes("block")) {
      return "El navegador bloqueó la ventana. Este flujo usa redirección; prueba de nuevo o desactiva bloqueadores para este sitio.";
    }
    if (lower.includes("redirect") || name === "invalid_redirect_exception") {
      return "La URL de retorno no coincide con la configurada en Cognito. Revisa NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_IN y las callback URLs del cliente.";
    }
    if (message.includes("GOOGLE_OAUTH_CONFIG_MISSING") || name === "OAuthNotConfigureException") {
      return "Google no está configurado: dominio Hosted UI, Google como proveedor y variable NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_IN (ver comentarios en AuthenticationService.js).";
    }
    if (lower.includes("already a signed in user") || name === "UserAlreadyAuthenticatedException") {
      return "Ya hay una sesión activa. Cierra sesión o recarga la página.";
    }
    if ((lower.includes("account") && lower.includes("exist")) || lower.includes("different login")) {
      return "Ya existe una cuenta con este correo con otro método de acceso. Usa email y contraseña o el botón de Google en «Iniciar sesión».";
    }
    if (message === "NO_SESSION_AFTER_OAUTH" || lower.includes("no_session_after_oauth")) {
      return "No se pudo completar la sesión con Google. Vuelve a intentarlo desde la página de acceso.";
    }
    return "No se ha podido completar el acceso con Google. Inténtalo de nuevo.";
  }

  /**
   * Tras el redirect de Cognito: asegura tokens en cookies y alinea localStorage.username con LastAuthUser.
   * @returns {Promise<object>} payload del idToken
   */
  static async finishGoogleRedirectAndSyncSession() {
    configureAmplify();
    const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
    const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
    if (!userPoolId || !userPoolClientId) {
      throw new Error("Missing Cognito env vars: NEXT_PUBLIC_USER_POOL_ID and/or NEXT_PUBLIC_USER_POOL_CLIENT_ID");
    }
    this.ensureBrowserCookieStorage();
    const session = await fetchAuthSession();
    const idTokenString = session.tokens?.idToken?.toString();
    if (!idTokenString) {
      throw new Error("NO_SESSION_AFTER_OAUTH");
    }
    const { payload } = decodeJWT(idTokenString);
    let cognitoUsername;
    try {
      const user = await getCurrentUser();
      cognitoUsername = user.username;
    } catch {
      cognitoUsername = payload["cognito:username"] || payload.email;
    }
    if (typeof window !== "undefined" && cognitoUsername) {
      localStorage.setItem("username", cognitoUsername);
    }
    return payload;
  }
}
