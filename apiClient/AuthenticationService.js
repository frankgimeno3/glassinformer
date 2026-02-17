import { Amplify } from "aws-amplify";
import { signIn, confirmSignIn, signOut } from "aws-amplify/auth/cognito";
import { signUp, confirmSignUp, resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage, decodeJWT, fetchAuthSession } from "@aws-amplify/core";

let isConfigured = false;

function configureAmplify() {
  // Only configure once
  if (isConfigured) {
    return;
  }

  const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
  const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;

  // Only configure if env vars are available (skip during build if they're not set)
  if (!userPoolId || !userPoolClientId) {
    // During build time, env vars might not be available, so we'll configure later at runtime
    // This prevents build failures while still allowing runtime configuration
    return;
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: {
          username: true
        }
      }
    }
  });

  isConfigured = true;
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

    const response = await signIn({
      username,
      password
    });

    if (response.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
      const newPassword = prompt("Por favor, introduzca nueva contraseña");
      if (!newPassword) {
        throw new Error("Nueva contraseña requerida.");
      }
      await confirmSignIn({
        challengeResponse: newPassword
      });
    }

    const session = await fetchAuthSession();

    const idTokenString = session.tokens?.idToken?.toString();
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
}
