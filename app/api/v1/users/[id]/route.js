import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getProfileUserById } from "../../../../server/features/userProfile/UserProfileService.js";

export const runtime = "nodejs";

/** Get id from Next.js route params, with fallback to path parsing. */
async function getId(request, context) {
    const params = context?.params != null ? await Promise.resolve(context.params) : null;
    if (params?.id != null && typeof params.id === "string") {
        return params.id;
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
    return segment;
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
