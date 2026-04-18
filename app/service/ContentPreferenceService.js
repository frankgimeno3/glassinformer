import apiClient from "../apiClient.js";

export class ContentPreferenceService {
    static async list() {
        const res = await apiClient.get("/api/v1/users/me/content-preferences");
        return Array.isArray(res.data) ? res.data : [];
    }

    /**
     * @param {number} topicId
     * @param {'neutral' | 'not interested' | 'very interested'} preferenceState
     */
    static async update(topicId, preferenceState) {
        const res = await apiClient.patch("/api/v1/users/me/content-preferences", {
            topic_id: topicId,
            preference_state: preferenceState,
        });
        return res.data;
    }
}
