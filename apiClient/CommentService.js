import apiClient from "../app/apiClient.js";

export class CommentService {
    /**
     * @param {string} idArticle
     * @param {{ limit?: number, offset?: number }} [params]
     * @returns {Promise<{ comments: object[], total: number }>}
     */
    static async getComments(idArticle, params = {}) {
        const searchParams = new URLSearchParams();
        if (params.limit != null) searchParams.set("limit", String(params.limit));
        if (params.offset != null) searchParams.set("offset", String(params.offset));
        const query = searchParams.toString();
        const url = `/api/v1/articles/${encodeURIComponent(idArticle)}/comments${query ? `?${query}` : ""}`;
        const response = await apiClient.get(url);
        return response.data;
    }

    /**
     * @param {string} idArticle
     * @param {string} comment_content
     * @returns {Promise<object>}
     */
    static async createComment(idArticle, comment_content) {
        const response = await apiClient.post(
            `/api/v1/articles/${encodeURIComponent(idArticle)}/comments`,
            { comment_content }
        );
        return response.data;
    }

    /**
     * @param {string} idArticle
     * @param {string} idComment
     * @returns {Promise<{ success: boolean }>}
     */
    static async deleteComment(idArticle, idComment) {
        const response = await apiClient.delete(
            `/api/v1/articles/${encodeURIComponent(idArticle)}/comments/${encodeURIComponent(idComment)}`
        );
        return response.data;
    }
}
