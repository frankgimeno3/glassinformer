import { createEndpoint } from "../../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import {
    getActiveEmployeeCompaniesForSessionUser,
    getAdminCompaniesForSessionUser,
} from "../../../../../server/features/userProfile/UserProfileService.js";

export const runtime = "nodejs";

// GET: active employee_relations + company_administrators for the authenticated user (joined with companies data)
export const GET = createEndpoint(
    async (request) => {
        const email = request.email;
        if (!email) {
            return new Response(JSON.stringify({ message: "No hay sesión" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        const [companies, adminCompanies] = await Promise.all([
            getActiveEmployeeCompaniesForSessionUser(email),
            getAdminCompaniesForSessionUser(email),
        ]);
        return NextResponse.json({ companies, adminCompanies });
    },
    null,
    true
);

