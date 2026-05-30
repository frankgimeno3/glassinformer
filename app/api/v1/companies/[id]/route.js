import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getCompanyById, updateCompanyByAdministrator } from "../../../../server/features/company/CompanyService.js";
import Joi from "joi";

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

const putSchema = Joi.object({
    company_name: Joi.string().allow("").optional(),
    country: Joi.string().allow("").optional(),
    main_description: Joi.string().allow("").optional(),
    category: Joi.string().allow("").optional(),
    company_main_image: Joi.string().allow("").max(2048).optional(),
}).min(1);

export const PUT = createEndpoint(async (request, body) => {
    const id = getIdFromRequest(request);
    const userId = request?.sub;
    const updated = await updateCompanyByAdministrator(id, userId, body);
    return NextResponse.json(updated);
}, putSchema, true);
