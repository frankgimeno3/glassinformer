import apiClient from "../app/apiClient.js";

function toArray(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
}

export class CompanyService {
    static async getAllCompanies() {
        const response = await apiClient.get("/api/v1/companies");
        return toArray(response.data);
    }

    static async getCompanyById(idCompany) {
        const response = await apiClient.get(`/api/v1/companies/${encodeURIComponent(idCompany)}`);
        return response.data;
    }
}
