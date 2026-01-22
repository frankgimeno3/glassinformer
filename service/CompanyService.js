import apiClient from "../app/apiClient.js";

export class CompanyService {
    static async getAllCompanies() {
        const response = await apiClient.get('/api/v1/companies');
        return response.data;
    }

    static async getCompanyById(idCompany) {
        const response = await apiClient.get(`/api/v1/companies/${idCompany}`);
        return response.data;
    }
}
