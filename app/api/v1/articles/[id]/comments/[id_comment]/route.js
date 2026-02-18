import { createEndpoint } from "../../../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { deleteComment } from "../../../../../../server/features/comment/CommentService.js";

/**
 * DELETE a comment. Requires auth; only the comment author can delete.
 * params: id (article id), id_comment (comment id)
 */
export const DELETE = createEndpoint(async (request, _body, context) => {
    const params = context?.params != null ? await Promise.resolve(context.params) : null;
    const idArticle = params?.id;
    const idComment = params?.id_comment;
    if (!idArticle || !idComment) {
        return new Response(JSON.stringify({ message: "Missing id or id_comment" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }
    const decodedCommentId = decodeURIComponent(idComment);
    const email = request.email;
    if (!email) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }
    await deleteComment(decodedCommentId, email);
    return NextResponse.json({ success: true });
}, null, true);
