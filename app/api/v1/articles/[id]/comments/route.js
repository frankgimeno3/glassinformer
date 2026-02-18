import { createEndpoint } from "../../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getCommentsByArticleId, createComment } from "../../../../../server/features/comment/CommentService.js";
import Joi from "joi";

function getIdFromRequest(request) {
    const url = new URL(request.url);
    const match = url.pathname.match(/\/api\/v1\/articles\/([^\/]+)\/comments/);
    if (match && match[1]) {
        return decodeURIComponent(match[1]);
    }
    throw new Error("Article ID not found in URL");
}

const COMMENTS_PAGE_SIZE = 10;

// GET: list comments for the article (paginated, newest first). Public.
export const GET = createEndpoint(async (request) => {
    const idArticle = getIdFromRequest(request);
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit")) || COMMENTS_PAGE_SIZE, 50);
    const offset = Number(url.searchParams.get("offset")) || 0;
    const { comments, total } = await getCommentsByArticleId(idArticle, limit, offset);
    return NextResponse.json({ comments, total });
}, null, false);

// POST: create a comment. Requires auth; author = request.email (id_user).
export const POST = createEndpoint(
    async (request, body) => {
        const idArticle = getIdFromRequest(request);
        const commentIdUser = request.email;
        if (!commentIdUser) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }
        const comment = await createComment(idArticle, commentIdUser, body.comment_content);
        return NextResponse.json(comment);
    },
    Joi.object({
        comment_content: Joi.string().min(1).max(10000).required()
    }),
    true
);
