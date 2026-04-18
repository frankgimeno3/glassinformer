import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getEventNewsArticles } from "../../../../server/features/event/EventService.js";

export const runtime = "nodejs";

export const GET = createEndpoint(async () => {
  const articles = await getEventNewsArticles();
  return NextResponse.json(articles);
}, null, false);

