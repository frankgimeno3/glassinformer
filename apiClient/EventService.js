import apiClient from "../app/apiClient.js";

export class EventService {
    static async getAllEvents() {
        const response = await apiClient.get('/api/v1/events');
        return response.data;
    }

    static async getEventById(idFair) {
        const response = await apiClient.get(`/api/v1/events/${encodeURIComponent(idFair)}`);
        return response.data;
    }

    static async getEventNewsArticles() {
        const response = await apiClient.get('/api/v1/events/news');
        return response.data;
    }
}
