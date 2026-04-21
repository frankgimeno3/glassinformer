import apiClient from "../app/apiClient.js";

/**
 * @param {string} email
 * @returns {Promise<boolean>} true if Cognito already has this username (email)
 */
export async function isSignupEmailAlreadyRegistered(email) {
    const response = await apiClient.get("/api/v1/auth/signup-email-status", {
        params: { email: String(email || "").trim() },
    });
    return response.data?.emailRegistered === true;
}
