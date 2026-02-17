import apiClient from "../app/apiClient.js";

/**
 * Crea un usuario de perfil en RDS (tabla users) con id_user = email y campos en blanco.
 * Se llama tras el registro en Cognito.
 * @param {string} id_user - Email del usuario
 * @returns {Promise<object>}
 */
export async function createProfileUser(id_user) {
    const response = await apiClient.post("/api/v1/users", { id_user });
    return response.data;
}
