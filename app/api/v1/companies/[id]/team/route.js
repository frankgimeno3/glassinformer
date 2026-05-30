import { createEndpoint } from "../../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getActiveCompanyTeam } from "../../../../../server/features/company/CompanyService.js";

function getIdFromRequest(request) {
    const url = new URL(request.url);
    const match = url.pathname.match(/\/api\/v1\/companies\/([^/]+)\/team/);
    if (match && match[1]) {
        return decodeURIComponent(match[1]);
    }
    throw new Error("Company ID not found in URL");
}

export const runtime = "nodejs";

export const GET = createEndpoint(async (request) => {
    const companyId = getIdFromRequest(request);
    const team = await getActiveCompanyTeam(companyId);
    return NextResponse.json(team);
}, null, false);

