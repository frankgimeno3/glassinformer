import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getProfileUserById } from "../../../../server/features/userProfile/UserProfileService.js";

export const runtime = "nodejs";

function getIdFromRequest(request) {
    const url = new URL(request.url);
    const match = url.pathname.match(/\/api\/v1\/users\/([^/]+)/);
    if (match && match[1]) {
        return decodeURIComponent(match[1]);
    }
    throw new Error("User ID not found in URL");
}

export const GET = createEndpoint(
    async (request) => {
        const id = getIdFromRequest(request);
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
