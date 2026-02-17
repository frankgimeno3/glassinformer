import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getProfileUserById } from "../../../../server/features/userProfile/UserProfileService.js";

export const runtime = "nodejs";

/** Decode id so %40 in URL becomes @ for DB lookup (id_user is email). */
function decodeId(segment) {
    if (!segment || typeof segment !== "string") return segment;
    try {
        return decodeURIComponent(segment);
    } catch {
        return segment;
    }
}

/** Get id from Next.js route params, with fallback to path parsing. Always decode for DB (e.g. %40 → @). */
async function getId(request, context) {
    const params = context?.params != null ? await Promise.resolve(context.params) : null;
    if (params?.id != null && typeof params.id === "string") {
        return decodeId(params.id);
    }
    const pathname = new URL(request.url).pathname;
    const prefix = "/api/v1/users/";
    if (!pathname.startsWith(prefix)) {
        throw new Error("User ID not found in URL");
    }
    const segment = pathname.slice(prefix.length).split("/")[0];
    if (!segment) {
        throw new Error("User ID not found in URL");
    }
    return decodeId(segment);
}

export const GET = createEndpoint(
    async (request, _body, context) => {
        const id = await getId(request, context);
        const user = await getProfileUserById(id);
        if (!user) {
            return new Response(JSON.stringify({ message: "Usuario no encontrado" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }
        return NextResponse.json(user);
    },
    null,
    true
);
