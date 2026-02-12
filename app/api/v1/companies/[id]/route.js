import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getCompanyById } from "../../../../server/features/company/CompanyService.js";

function getIdFromRequest(request) {
    const url = new URL(request.url);
    const match = url.pathname.match(/\/api\/v1\/companies\/([^/]+)/);
    if (match && match[1]) {
        return decodeURIComponent(match[1]);
    }
    throw new Error("Company ID not found in URL");
}

export const runtime = "nodejs";

export const GET = createEndpoint(async (request) => {
    const id = getIdFromRequest(request);
    const company = await getCompanyById(id);
    return NextResponse.json(company);
}, null, false);
