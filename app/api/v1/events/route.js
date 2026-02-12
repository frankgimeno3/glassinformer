import { createEndpoint } from "../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getAllEvents } from "../../../server/features/event/EventService.js";

export const runtime = "nodejs";

export const GET = createEndpoint(async () => {
    const events = await getAllEvents();
    return NextResponse.json(events);
}, null, false);
