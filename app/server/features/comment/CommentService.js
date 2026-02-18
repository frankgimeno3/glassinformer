import CommentModel from "./CommentModel.js";
import ArticleModel from "../article/ArticleModel.js";
import UserProfileModel from "../userProfile/UserProfileModel.js";
import "../../database/models.js";

const COMMENTS_PAGE_SIZE = 10;

function isCommentsTableMissingError(error) {
    const msg = error?.message ?? "";
    return (
        error?.name === "SequelizeDatabaseError" &&
        (msg.includes('relation "comments" does not exist') || msg.includes("comments") && msg.includes("does not exist"))
    );
}

/**
 * Get next serial number for a new comment on an article (e.g. 1, 2, 3...).
 * @param {string} idArticle
 * @returns {Promise<number>}
 */
export async function getNextCommentSerial(idArticle) {
    try {
        const count = await CommentModel.count({ where: { id_article: idArticle } });
        return count + 1;
    } catch (err) {
        if (isCommentsTableMissingError(err)) return 1;
        throw err;
    }
}

/**
 * Build id_comment: id_article + "-" + 0000x (e.g. "art-1-00001").
 * @param {string} idArticle
 * @param {number} serial
 * @returns {string}
 */
function buildIdComment(idArticle, serial) {
    const pad = String(serial).padStart(5, "0");
    return `${idArticle}-${pad}`;
}

/**
 * Fetch comments for an article with author user_name and user_surnames.
 * Ordered newest first. Paginated (limit + offset).
 * @param {string} idArticle
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<{ comments: object[], total: number }>}
 */
export async function getCommentsByArticleId(idArticle, limit = COMMENTS_PAGE_SIZE, offset = 0) {
    if (!CommentModel.sequelize) {
        return { comments: [], total: 0 };
    }
    try {
        const { rows, count } = await CommentModel.findAndCountAll({
            where: { id_article: idArticle },
            order: [["id_timestamp", "DESC"]],
            limit,
            offset,
            include: [{
                model: UserProfileModel,
                as: "user",
                attributes: ["id_user", "user_name", "user_surnames"],
                required: false
            }]
        });
        const comments = rows.map((row) => {
            const u = row.user;
            return {
                id_comment: row.id_comment,
                id_timestamp: row.id_timestamp ? new Date(row.id_timestamp).toISOString() : null,
                comment_id_user: row.comment_id_user,
                comment_content: row.comment_content,
                user_name: u?.user_name ?? "",
                user_surnames: u?.user_surnames ?? ""
            };
        });
        return { comments, total: count };
    } catch (err) {
        if (isCommentsTableMissingError(err)) {
            return { comments: [], total: 0 };
        }
        throw err;
    }
}

/**
 * Create a new comment and append id_comment to article.comments_array.
 * @param {string} idArticle
 * @param {string} commentIdUser - author (id_user / email)
 * @param {string} commentContent
 * @returns {Promise<object>}
 */
export async function createComment(idArticle, commentIdUser, commentContent) {
    const article = await ArticleModel.findByPk(idArticle);
    if (!article) {
        throw new Error(`Article with id ${idArticle} not found`);
    }
    try {
        const serial = await getNextCommentSerial(idArticle);
        const idComment = buildIdComment(idArticle, serial);
        const idTimestamp = new Date();

        const comment = await CommentModel.create({
            id_comment: idComment,
            id_article: idArticle,
            id_timestamp: idTimestamp,
            comment_id_user: commentIdUser,
            comment_content: commentContent
        });

        // Update article.comments_array only if the column exists (optional; comments are read from comments table)
        if (article.comments_array) {
            const commentsArray = Array.isArray(article.comments_array) ? [...article.comments_array] : [];
            commentsArray.push(idComment);
            await article.update({ comments_array: commentsArray }).catch(() => {});
        }

        const user = await UserProfileModel.findByPk(commentIdUser);
        return {
            id_comment: comment.id_comment,
            id_timestamp: idTimestamp.toISOString(),
            comment_id_user: comment.comment_id_user,
            comment_content: comment.comment_content,
            user_name: user?.user_name ?? "",
            user_surnames: user?.user_surnames ?? ""
        };
    } catch (err) {
        if (isCommentsTableMissingError(err)) {
            throw new Error("Comments table is not set up in the database. Run the SQL in app/server/database/scripts/create_comments_table.sql in your RDS client.");
        }
        throw err;
    }
}

/**
 * Delete a comment by id_comment. Only the author (comment_id_user) may delete.
 * @param {string} idComment
 * @param {string} requestEmail - id_user of the requester (must match comment_id_user)
 * @returns {Promise<void>}
 */
export async function deleteComment(idComment, requestEmail) {
    if (!CommentModel.sequelize) {
        throw new Error("Comments table is not available");
    }
    const comment = await CommentModel.findByPk(idComment);
    if (!comment) {
        throw new Error(`Comment ${idComment} not found`);
    }
    if (comment.comment_id_user !== requestEmail) {
        throw new Error("You can only delete your own comment");
    }
    await comment.destroy();
}
