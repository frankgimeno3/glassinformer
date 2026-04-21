import apiClient from "../app/apiClient.js";

/**
 * Crea un usuario de perfil en RDS (tabla users_db) usando el email.
 * Se llama tras el registro en Cognito.
 * @param {string} id_user - Email del usuario
 * @param {{ subscribePortalNewsletter?: boolean }} [options]
 * @returns {Promise<object>}
 */
export async function createProfileUser(id_user, options = {}) {
    const response = await apiClient.post("/api/v1/users", {
        id_user,
        subscribe_portal_newsletter: options.subscribePortalNewsletter === true,
    });
    return response.data;
}

/**
 * Tras OAuth Google: crea/actualiza fila en RDS según claims del idToken (sesión en cookies).
 * @param {{ subscribePortalNewsletter?: boolean }} [options]
 */
export async function syncOAuthProfileFromSession(options = {}) {
    const response = await apiClient.post("/api/v1/users/me/oauth-profile-sync", {
        subscribe_portal_newsletter: options.subscribePortalNewsletter === true,
    });
    return response.data;
}
