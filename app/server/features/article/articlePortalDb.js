import { QueryTypes } from "sequelize";
import Database from "../../database/database.js";

function getSequelize() {
    const db = Database.getInstance();
    return db.getSequelize();
}

/**
 * @param {string} articleId
 * @param {number} portalRefId - portals.id / article_portal_ref_id
 * @returns {Promise<string|null>} article_portals_id UUID
 */
export async function getArticlePortalsIdForPortal(articleId, portalRefId) {
    const sequelize = getSequelize();
    const rows = await sequelize.query(
        `SELECT article_portals_id::text AS id
         FROM article_portals
         WHERE article_id = :articleId
           AND article_portal_ref_id = :portalRefId
           AND article_status = 'published'
           AND article_visibility = 'public'
         LIMIT 1`,
        { replacements: { articleId, portalRefId }, type: QueryTypes.SELECT }
    );
    return rows?.[0]?.id ?? null;
}

/** @returns {Promise<string|null>} UUID */
export async function resolveUserIdByEmail(email) {
    if (!email || !String(email).trim()) return null;
    const sequelize = getSequelize();
    try {
        const rows = await sequelize.query(
            `SELECT user_id::text AS id
             FROM users_db
             WHERE lower(trim(coalesce(user_email::text, ''))) = lower(trim(:email))
             LIMIT 1`,
            { replacements: { email: String(email).trim() }, type: QueryTypes.SELECT }
        );
        return rows?.[0]?.id ?? null;
    } catch {
        return null;
    }
}

export async function createArticlePublications(articleId, portalIds, articleTitle = "") {
    if (!Array.isArray(portalIds) || portalIds.length === 0) return;
    const sequelize = getSequelize();
    const baseSlug =
        (articleTitle || articleId)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "") || articleId.replace(/_/g, "-");
    for (const portalId of portalIds) {
        let finalSlug = baseSlug;
        let suffix = 0;
        for (;;) {
            const collision = await sequelize.query(
                `SELECT 1 FROM article_portals WHERE article_portal_ref_id = :portalId AND article_slug = :slug`,
                { replacements: { portalId, slug: finalSlug }, type: QueryTypes.SELECT }
            );
            if (!collision || collision.length === 0) break;
            finalSlug = `${baseSlug}-${++suffix}`;
        }
        await sequelize.query(
            `INSERT INTO article_portals (article_id, article_portal_ref_id, article_slug, article_status, article_visibility, article_commenting_enabled)
             VALUES (:articleId, :portalId, :slug, 'published', 'public', true)`,
            { replacements: { articleId, portalId, slug: finalSlug } }
        );
    }
}

export async function getPublicationsByArticleId(articleId) {
    const sequelize = getSequelize();
    const rows = await sequelize.query(
        `SELECT ap.article_portal_ref_id AS "portalId"
         FROM article_portals ap
         WHERE ap.article_id = :articleId`,
        { replacements: { articleId }, type: QueryTypes.SELECT }
    );
    return rows || [];
}

export async function setHighlightPositionInPortal(articleId, portalId, highlightPosition) {
    const pos = (highlightPosition || "").trim();
    const sequelize = getSequelize();
    if (pos) {
        await sequelize.query(
            `UPDATE article_portals SET article_highlight_position = ''
             WHERE article_portal_ref_id = :portalId AND article_highlight_position = :pos`,
            { replacements: { portalId, pos } }
        );
    }
    await sequelize.query(
        `UPDATE article_portals SET article_highlight_position = :pos
         WHERE article_id = :articleId AND article_portal_ref_id = :portalId`,
        { replacements: { articleId, portalId, pos } }
    );
}
