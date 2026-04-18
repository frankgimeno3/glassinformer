import CommentModel from "./CommentModel.js";
import ArticleModel from "../article/ArticleModel.js";
import "../../database/models.js";
import { portal_id } from "../../../GlassInformerSpecificData.js";
import {
    getArticlePortalsIdForPortal,
    resolveUserIdByEmail,
} from "../article/articlePortalDb.js";

const { QueryTypes } = require("sequelize");

const COMMENTS_PAGE_SIZE = 10;

function isArticleCommentsMissingError(error) {
    const msg = String(error?.message ?? "");
    return (
        error?.name === "SequelizeDatabaseError" &&
        msg.includes("article_comments") &&
        msg.includes("does not exist")
    );
}

function buildIdComment(idArticle, serial) {
    const pad = String(serial).padStart(5, "0");
    return `${idArticle}-${pad}`;
}

export async function getCommentsByArticleId(idArticle, limit = COMMENTS_PAGE_SIZE, offset = 0) {
    if (!CommentModel.sequelize) {
        return { comments: [], total: 0 };
    }
    try {
        const portalsId = await getArticlePortalsIdForPortal(idArticle, portal_id);
        if (!portalsId) {
            return { comments: [], total: 0 };
        }

        const sequelize = CommentModel.sequelize;
        const countRows = await sequelize.query(
            `SELECT COUNT(*)::int AS c FROM article_comments WHERE article_portals_id = CAST(:pid AS uuid)`,
            { replacements: { pid: portalsId }, type: QueryTypes.SELECT }
        );
        const total = countRows?.[0]?.c ?? 0;

        const rows = await sequelize.query(
            `SELECT ac.article_comment_id AS id_comment,
                    ac.article_comment_timestamp AS id_timestamp,
                    ac.article_comment_user_id,
                    ac.article_comment_content AS comment_content,
                    COALESCE(ud.user_name::text, '') AS user_name,
                    COALESCE(ud.user_surnames::text, '') AS user_surnames
             FROM article_comments ac
             LEFT JOIN users_db ud ON ud.user_id = ac.article_comment_user_id
             WHERE ac.article_portals_id = CAST(:pid AS uuid)
             ORDER BY ac.article_comment_timestamp DESC
             LIMIT :limit OFFSET :offset`,
            { replacements: { pid: portalsId, limit, offset }, type: QueryTypes.SELECT }
        );

        const comments = (rows || []).map((row) => ({
            id_comment: row.id_comment,
            id_timestamp: row.id_timestamp ? new Date(row.id_timestamp).toISOString() : null,
            comment_id_user: row.article_comment_user_id
                ? String(row.article_comment_user_id)
                : "",
            comment_content: row.comment_content,
            user_name: row.user_name ?? "",
            user_surnames: row.user_surnames ?? "",
        }));
        return { comments, total };
    } catch (err) {
        if (isArticleCommentsMissingError(err)) {
            return { comments: [], total: 0 };
        }
        throw err;
    }
}

export async function getNextCommentSerial(idArticle) {
    if (!CommentModel.sequelize) return 1;
    try {
        const portalsId = await getArticlePortalsIdForPortal(idArticle, portal_id);
        if (!portalsId) return 1;
        const rows = await CommentModel.sequelize.query(
            `SELECT COUNT(*)::int AS c FROM article_comments WHERE article_portals_id = CAST(:pid AS uuid)`,
            { replacements: { pid: portalsId }, type: QueryTypes.SELECT }
        );
        return (rows?.[0]?.c ?? 0) + 1;
    } catch (err) {
        if (isArticleCommentsMissingError(err)) return 1;
        throw err;
    }
}

export async function createComment(idArticle, commentIdUser, commentContent) {
    if (!ArticleModel.sequelize) {
        throw new Error("Database not available");
    }

    const checkRows = await ArticleModel.sequelize.query(
        `SELECT 1 FROM articles_db a
         INNER JOIN article_portals ap ON a.id_article = ap.article_id AND ap.article_portal_ref_id = :portalId
         WHERE a.id_article = :idArticle
           AND ap.article_status = 'published' AND ap.article_visibility = 'public'
         LIMIT 1`,
        { replacements: { portalId: portal_id, idArticle }, type: QueryTypes.SELECT }
    );
    if (!checkRows || checkRows.length === 0) {
        throw new Error(`Article with id ${idArticle} not found`);
    }

    const portalsId = await getArticlePortalsIdForPortal(idArticle, portal_id);
    if (!portalsId) {
        throw new Error(`Article with id ${idArticle} not found for this portal`);
    }

    const serial = await getNextCommentSerial(idArticle);
    const idComment = buildIdComment(idArticle, serial);
    const userUuid = await resolveUserIdByEmail(commentIdUser);

    try {
        if (userUuid) {
            await CommentModel.sequelize.query(
                `INSERT INTO article_comments (
                    article_comment_id, article_comment_timestamp, article_comment_user_id, article_comment_content, article_portals_id
                ) VALUES (
                    :idComment, NOW(), CAST(:userUuid AS uuid), :content, CAST(:portalsId AS uuid)
                )`,
                {
                    replacements: {
                        idComment,
                        userUuid,
                        content: commentContent,
                        portalsId,
                    },
                }
            );
        } else {
            await CommentModel.sequelize.query(
                `INSERT INTO article_comments (
                    article_comment_id, article_comment_timestamp, article_comment_user_id, article_comment_content, article_portals_id
                ) VALUES (
                    :idComment, NOW(), NULL, :content, CAST(:portalsId AS uuid)
                )`,
                {
                    replacements: { idComment, content: commentContent, portalsId },
                }
            );
        }
    } catch (err) {
        if (isArticleCommentsMissingError(err)) {
            throw new Error(
                "Comments are not available: ensure migration 053 (article_comments) from plynium_central_panel is applied on this database."
            );
        }
        throw err;
    }

    let userName = "";
    let userSurnames = "";
    if (userUuid) {
        const userRows = await CommentModel.sequelize.query(
            `SELECT user_name, user_surnames FROM users_db WHERE user_id = CAST(:uid AS uuid) LIMIT 1`,
            { replacements: { uid: userUuid }, type: QueryTypes.SELECT }
        );
        const u = userRows?.[0];
        userName = u?.user_name ?? "";
        userSurnames = u?.user_surnames ?? "";
    }

    return {
        id_comment: idComment,
        id_timestamp: new Date().toISOString(),
        // Never expose the author email; use users_db.user_id (UUID) instead.
        comment_id_user: userUuid ? String(userUuid) : "",
        comment_content: commentContent,
        user_name: userName,
        user_surnames: userSurnames,
    };
}

export async function deleteComment(idComment, requestEmail) {
    if (!CommentModel.sequelize) {
        throw new Error("Comments table is not available");
    }

    const requestUserId = await resolveUserIdByEmail(requestEmail);
    if (!requestUserId) {
        throw new Error("You can only delete your own comment");
    }

    const rows = await CommentModel.sequelize.query(
        `SELECT article_comment_id, article_comment_user_id, article_portals_id
         FROM article_comments
         WHERE article_comment_id = :idComment
         LIMIT 1`,
        { replacements: { idComment }, type: QueryTypes.SELECT }
    );
    const comment = rows?.[0];
    if (!comment) {
        throw new Error(`Comment ${idComment} not found`);
    }

    const portalRows = await CommentModel.sequelize.query(
        `SELECT article_portal_ref_id FROM article_portals WHERE article_portals_id = CAST(:pid AS uuid) LIMIT 1`,
        { replacements: { pid: comment.article_portals_id }, type: QueryTypes.SELECT }
    );
    const portalRef = portalRows?.[0]?.article_portal_ref_id;
    if (portalRef != null && Number(portalRef) !== Number(portal_id)) {
        throw new Error("Comment does not belong to this portal");
    }

    const authorId = comment.article_comment_user_id
        ? String(comment.article_comment_user_id)
        : "";
    if (!authorId || authorId !== requestUserId) {
        throw new Error("You can only delete your own comment");
    }

    await CommentModel.sequelize.query(`DELETE FROM article_comments WHERE article_comment_id = :idComment`, {
        replacements: { idComment },
    });
}
