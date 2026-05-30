import { createEndpoint } from "../../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { isCompanyAdministrator } from "../../../../../server/features/company/CompanyService.js";

function getIdFromRequest(request) {
    const url = new URL(request.url);
    const match = url.pathname.match(/\/api\/v1\/companies\/([^/]+)\/admin-status/);
    if (match && match[1]) {
        return decodeURIComponent(match[1]);
    }
    throw new Error("Company ID not found in URL");
}

export const runtime = "nodejs";

export const GET = createEndpoint(async (request) => {
    const companyId = getIdFromRequest(request);
    const userId = request?.sub;
    const isAdmin = await isCompanyAdministrator(companyId, userId);
    return NextResponse.json({ isAdmin });
}, null, true);

