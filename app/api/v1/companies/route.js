import { createEndpoint } from "../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getAllCompanies, createCompany } from "../../../server/features/company/CompanyService.js";
import Joi from "joi";

export const runtime = "nodejs";

const createCompanySchema = Joi.object({
    id_company: Joi.string().allow("").optional(),
    company_name: Joi.string().required(),
    country: Joi.string().allow("").optional(),
    main_description: Joi.string().allow("").optional(),
    region: Joi.string().allow("").optional(),
    productsArray: Joi.array().items(Joi.string()).optional(),
});

export const GET = createEndpoint(async () => {
    const companies = await getAllCompanies();
    return NextResponse.json(companies);
}, null, false);

export const POST = createEndpoint(async (_request, body) => {
    const company = await createCompany(body);
    return NextResponse.json(company);
}, createCompanySchema, true);
