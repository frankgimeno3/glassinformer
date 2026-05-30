import { createEndpoint } from "../../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { hasActiveEmployeeRelation } from "../../../../../server/features/company/CompanyService.js";
import { getProfileUserByEmail } from "../../../../../server/features/userProfile/UserProfileService.js";

function getIdFromRequest(request) {
    const url = new URL(request.url);
    const match = url.pathname.match(/\/api\/v1\/companies\/([^/]+)\/employee-status/);
    if (match && match[1]) {
        return decodeURIComponent(match[1]);
    }
    throw new Error("Company ID not found in URL");
}

export const runtime = "nodejs";

export const GET = createEndpoint(async (request) => {
    const companyId = getIdFromRequest(request);
    const email = request?.email;
    if (!email) {
        return NextResponse.json({ isEmployee: false }, { status: 401 });
    }
    const profile = await getProfileUserByEmail(email);
    const userId = profile?.id_user ? String(profile.id_user) : "";
    const isEmployee = await hasActiveEmployeeRelation(companyId, userId);
    return NextResponse.json({ isEmployee });
}, null, true);

