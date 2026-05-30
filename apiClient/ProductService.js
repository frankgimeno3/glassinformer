import apiClient from "../app/apiClient.js";

function toArray(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
}

export class ProductService {
    static async getAllProducts() {
        const response = await apiClient.get("/api/v1/products");
        return toArray(response.data);
    }

    static async getProductById(idProduct) {
        const response = await apiClient.get(`/api/v1/products/${encodeURIComponent(idProduct)}`);
        return response.data;
    }

    static async createProduct(data) {
        const response = await apiClient.post("/api/v1/products", data);
        return response.data;
    }

    /** Submit directory product request (panel_tickets + panel_ticket_product_data). */
    static async submitDirectoryProductRequest(data) {
        const response = await apiClient.post("/api/v1/products/directory-request", data);
        return response.data;
    }
}
