/**
 * Stub ArticleService until article storage (e.g. DB) is connected.
 */

export async function getAllArticles() {
    return [];
}

export async function createArticle(body) {
    return { ...body };
}

export async function getArticleById(id) {
    throw new Error("Article not found");
}

export async function updateArticle(id, body) {
    throw new Error("Article not found");
}

export async function deleteArticle(id) {
    throw new Error("Article not found");
}
