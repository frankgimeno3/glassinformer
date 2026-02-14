import apiClient from "../apiClient.js";

export class EventService {
    static async getAllEvents() {
        const response = await apiClient.get("/api/v1/events");
        return response.data;
    }

    static async getEventById(idEvent) {
        const response = await apiClient.get(`/api/v1/events/${idEvent}`);
        return response.data;
    }
}
