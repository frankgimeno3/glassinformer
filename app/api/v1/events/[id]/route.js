import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getEventById } from "../../../../server/features/event/EventService.js";

function getIdFromRequest(request) {
    const url = new URL(request.url);
    const match = url.pathname.match(/\/api\/v1\/events\/([^/]+)/);
    if (match && match[1]) {
        return decodeURIComponent(match[1]);
    }
    throw new Error('Event ID not found in URL');
}

export const runtime = "nodejs";

export const GET = createEndpoint(async (request) => {
    const id = getIdFromRequest(request);
    const event = await getEventById(id);
    return NextResponse.json(event);
}, null, false);
