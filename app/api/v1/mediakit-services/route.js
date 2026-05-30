import { createEndpoint } from "../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { listServicesForPortal } from "../../../server/features/service_catalog/MediakitCatalogService.js";
import { portal_id } from "../../../GlassInformerSpecificData.js";

export const runtime = "nodejs";

export const GET = createEndpoint(async () => {
    const services = await listServicesForPortal(portal_id);
    return NextResponse.json(services);
}, null, false);
