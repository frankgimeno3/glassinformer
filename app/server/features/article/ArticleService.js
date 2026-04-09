import ArticleModel from "./ArticleModel.js";
import { getContentsByArticleId } from "../content/ContentService.js";
import "../../database/models.js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { rewriteDeprecatedSourceUnsplashUrl } from "../../../lib/remoteImage";
import { portal_id } from "../../../GlassInformerSpecificData.js";
import {
    createArticlePublications,
    getPublicationsByArticleId,
    setHighlightPositionInPortal,
} from "./articlePortalDb.js";

const { QueryTypes } = require("sequelize");

function apiArticleMainImageUrl(url) {
    if (url == null || url === "") return url;
    return rewriteDeprecatedSourceUnsplashUrl(String(url));
}

function getFallbackArticles() {
    try {
        const jsonPath = join(process.cwd(), "app", "contents", "articlesContents.json");
        if (!existsSync(jsonPath)) {
            return [];
        }
        const fileContent = readFileSync(jsonPath, "utf-8");
        const articles = JSON.parse(fileContent);
        return articles
            .filter((article) => (article.portal_id ?? null) === portal_id)
            .map((article) => ({
                id_article: article.id_article,
                articleTitle: article.articleTitle,
                articleSubtitle: article.articleSubtitle || "",
                article_main_image_url: apiArticleMainImageUrl(article.article_main_image_url || ""),
                company: article.company || "",
                date: article.date || new Date().toISOString().split("T")[0],
                portal_id: article.portal_id ?? null,
                article_tags_array: article.article_tags_array || [],
                contents_array: article.contents_array || [],
                highlited_position: article.highlited_position ?? "",
                isEventNews: article.isEventNews || false,
                is_article_event: article.is_article_event ?? article.isEventNews ?? false,
                event_id: article.event_id || null,
                article_countries_array: article.article_countries_array || [],
                article_region: article.article_region || "",
                author: article.author || "",
                contents: article.contents || [],
            }));
    } catch (error) {
        console.warn("Fallback articles JSON unreadable:", error.message);
        return [];
    }
}

function companyDisplayFromRow(plain) {
    const names = plain.article_company_names_array ?? plain.articleCompanyNamesArray;
    if (Array.isArray(names) && names.length > 0) {
        return names.map((s) => String(s).trim()).filter(Boolean).join(", ");
    }
    if (typeof plain.company === "string" && plain.company.trim()) return plain.company.trim();
    return "";
}

function transformArticleToApiFormat(row) {
    const plain = row && typeof row.get === "function" ? row.get({ plain: true }) : row;
    const dateVal = plain.date ?? plain.article_date;
    return {
        id_article: plain.id_article,
        articleTitle: plain.article_title ?? plain.articleTitle,
        articleSubtitle: plain.article_subtitle ?? plain.articleSubtitle ?? null,
        article_main_image_url: apiArticleMainImageUrl(plain.article_main_image_url ?? null),
        company: companyDisplayFromRow(plain),
        date: dateVal ? new Date(dateVal).toISOString().split("T")[0] : null,
        portal_id: portal_id,
        article_tags_array: [],
        contents_array: [],
        highlited_position:
            plain.highlited_position ??
            plain.article_highlight_position ??
            "",
        is_article_event: plain.is_article_event ?? false,
        event_id: plain.event_id ?? plain.article_event_id ?? null,
        comments_array: [],
    };
}

function normalizeCompanyArraysFromPayload(articleData) {
    let names = Array.isArray(articleData?.article_company_names_array)
        ? articleData.article_company_names_array.map((s) => String(s).trim()).filter(Boolean)
        : [];
    let ids = Array.isArray(articleData?.article_company_id_array)
        ? articleData.article_company_id_array.map((s) => String(s ?? "").trim())
        : [];
    if (names.length === 0 && typeof articleData?.company === "string" && articleData.company.trim()) {
        names = [articleData.company.trim()];
        ids = [""];
    }
    while (ids.length < names.length) ids.push("");
    if (ids.length > names.length) ids = ids.slice(0, names.length);
    return { names, ids };
}

function buildCreatePayload(articleData) {
    const { names, ids } = normalizeCompanyArraysFromPayload(articleData);
    return {
        id_article: articleData.id_article,
        article_title: articleData.articleTitle,
        article_subtitle: articleData.articleSubtitle,
        article_main_image_url: articleData.article_main_image_url,
        article_company_names_array: names,
        article_company_id_array: ids,
        date: articleData.date,
        is_article_event: articleData.is_article_event === true,
        event_id:
            articleData.is_article_event === true && articleData.event_id
                ? String(articleData.event_id).trim()
                : "",
    };
}

function buildUpdatePayload(articleData) {
    const payload = {};
    if (articleData.articleTitle !== undefined) payload.article_title = articleData.articleTitle;
    if (articleData.articleSubtitle !== undefined) payload.article_subtitle = articleData.articleSubtitle;
    if (articleData.article_main_image_url !== undefined)
        payload.article_main_image_url = articleData.article_main_image_url;
    if (
        articleData.article_company_names_array !== undefined ||
        articleData.article_company_id_array !== undefined ||
        articleData.company !== undefined
    ) {
        const { names, ids } = normalizeCompanyArraysFromPayload({
            article_company_names_array: articleData.article_company_names_array,
            article_company_id_array: articleData.article_company_id_array,
            company: articleData.company,
        });
        payload.article_company_names_array = names;
        payload.article_company_id_array = ids;
    }
    if (articleData.date !== undefined) payload.date = articleData.date;
    if (articleData.is_article_event !== undefined) {
        payload.is_article_event = articleData.is_article_event === true;
        if (!payload.is_article_event) payload.event_id = "";
    }
    if (articleData.event_id !== undefined) payload.event_id = (articleData.event_id || "").trim();
    return payload;
}

const LIST_ARTICLES_SQL = `
SELECT a.id_article, a.article_title, a.article_subtitle, a.article_main_image_url,
       a.article_company_names_array, a.article_company_id_array, a.article_date AS date,
       COALESCE(NULLIF(TRIM(ap.article_highlight_position), ''), NULLIF(TRIM(a.article_highlited_position), '')) AS highlited_position,
       a.is_article_event, a.article_event_id AS event_id
FROM articles_db a
INNER JOIN article_portals ap ON a.id_article = ap.article_id AND ap.article_portal_ref_id = :portalId
WHERE ap.article_status = 'published' AND ap.article_visibility = 'public'
ORDER BY COALESCE(ap.article_published_at, a.article_date) DESC NULLS LAST
`;

const ONE_ARTICLE_SQL = `
SELECT a.id_article, a.article_title, a.article_subtitle, a.article_main_image_url,
       a.article_company_names_array, a.article_company_id_array, a.article_date AS date,
       COALESCE(NULLIF(TRIM(ap.article_highlight_position), ''), NULLIF(TRIM(a.article_highlited_position), '')) AS highlited_position,
       a.is_article_event, a.article_event_id AS event_id
FROM articles_db a
INNER JOIN article_portals ap ON a.id_article = ap.article_id AND ap.article_portal_ref_id = :portalId
WHERE a.id_article = :idArticle
  AND ap.article_status = 'published' AND ap.article_visibility = 'public'
LIMIT 1
`;

export async function getAllArticles() {
    try {
        if (!ArticleModel.sequelize) {
            console.warn("ArticleModel not initialized, using fallback data from JSON");
            return getFallbackArticles();
        }

        const rawRows = await ArticleModel.sequelize.query(LIST_ARTICLES_SQL, {
            replacements: { portalId: portal_id },
            type: QueryTypes.SELECT,
        });
        if (rawRows && rawRows.length > 0) {
            return rawRows.map(transformArticleToApiFormat);
        }
        return [];
    } catch (error) {
        console.error("Error fetching articles from database:", error);
        if (
            error.name === "SequelizeConnectionError" ||
            error.name === "SequelizeDatabaseError" ||
            error.name === "SequelizeConnectionRefusedError" ||
            error.message?.includes("ETIMEDOUT") ||
            error.message?.includes("ECONNREFUSED") ||
            (error.message?.includes("relation") && error.message?.includes("does not exist")) ||
            error.message?.includes("not initialized") ||
            error.message?.includes("Model not found")
        ) {
            console.warn("Database connection issue, using fallback data from JSON");
            return getFallbackArticles();
        }
        throw error;
    }
}

export async function getArticleById(idArticle) {
    if (!ArticleModel.sequelize) {
        throw new Error(`Article with id ${idArticle} not found`);
    }

    const rows = await ArticleModel.sequelize.query(ONE_ARTICLE_SQL, {
        replacements: { portalId: portal_id, idArticle },
        type: QueryTypes.SELECT,
    });
    const row = rows && rows[0];
    if (row) {
        const api = transformArticleToApiFormat(row);
        try {
            const contents = await getContentsByArticleId(idArticle);
            api.contents_array = contents.map((c) => c.content_id);
        } catch {
            api.contents_array = [];
        }
        return api;
    }
    throw new Error(`Article with id ${idArticle} not found`);
}

export async function createArticle(articleData) {
    const requestId = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[ArticleService] [${requestId}] Starting createArticle`);

    try {
        if (!ArticleModel.sequelize) {
            throw new Error("ArticleModel not initialized");
        }

        const { names } = normalizeCompanyArraysFromPayload(articleData);
        if (names.length < 1) {
            throw new Error("At least one company is required (company or article_company_names_array).");
        }

        const payload = buildCreatePayload(articleData);
        const highlitedPosition = (articleData.highlited_position || "").trim();
        const portalIdsFromBody = Array.isArray(articleData.portalIds)
            ? articleData.portalIds.filter((id) => Number.isInteger(Number(id))).map(Number)
            : [];
        const portalIds =
            portalIdsFromBody.length > 0 ? portalIdsFromBody : [portal_id];

        const article = await ArticleModel.create(payload);
        await createArticlePublications(article.id_article, portalIds, articleData.articleTitle);
        if (highlitedPosition && portalIds.length === 1) {
            await setHighlightPositionInPortal(article.id_article, portalIds[0], highlitedPosition);
        }

        return getArticleById(article.id_article);
    } catch (error) {
        console.error(`[ArticleService] [${requestId}] Error creating article:`, error);
        throw error;
    }
}

export async function updateArticle(idArticle, articleData) {
    const article = await ArticleModel.findByPk(idArticle);
    if (!article) {
        throw new Error(`Article with id ${idArticle} not found`);
    }

    if (articleData.highlited_position !== undefined) {
        const newPos = (articleData.highlited_position || "").trim();
        const publications = await getPublicationsByArticleId(idArticle);
        const portalId =
            articleData.portalId ??
            (publications.length === 1 ? publications[0].portalId : portal_id);
        if (portalId != null) {
            await setHighlightPositionInPortal(idArticle, portalId, newPos);
        }
    }

    const payload = buildUpdatePayload(articleData);
    if (
        payload.article_company_names_array !== undefined &&
        (!Array.isArray(payload.article_company_names_array) ||
            payload.article_company_names_array.length < 1)
    ) {
        throw new Error("At least one company is required (company or article_company_names_array).");
    }
    if (Object.keys(payload).length > 0) {
        await ArticleModel.update(payload, { where: { id_article: idArticle } });
    }

    return getArticleById(idArticle);
}

export async function deleteArticle(idArticle) {
    const sequelize = ArticleModel.sequelize;
    if (!sequelize) {
        throw new Error("ArticleModel not initialized");
    }
    const article = await ArticleModel.findByPk(idArticle);
    if (!article) {
        throw new Error(`Article with id ${idArticle} not found`);
    }

    const t = await sequelize.transaction();
    try {
        await sequelize.query(`DELETE FROM article_portals WHERE article_id = :id`, {
            replacements: { id: idArticle },
            transaction: t,
        });
        await sequelize.query(`DELETE FROM articles_db WHERE id_article = :id`, {
            replacements: { id: idArticle },
            transaction: t,
        });
        await t.commit();
    } catch (e) {
        await t.rollback();
        throw e;
    }

    return transformArticleToApiFormat(article);
}
