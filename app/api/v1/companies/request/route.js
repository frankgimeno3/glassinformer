import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import Joi from "joi";

export const runtime = "nodejs";

const requestSchema = Joi.object({
    requested_id: Joi.string().required(),
    company_name: Joi.string().required(),
    fiscal_name: Joi.string().required(),
    tax_id: Joi.string().allow("").optional(),
    user_position: Joi.string().required(),
    company_website: Joi.string().allow("").optional(),
    country: Joi.string().required(),
    description: Joi.string().allow("").optional(),
});

export const POST = createEndpoint(async (request, body) => {
    // Log for platform team - can be extended with email/SNS/DB storage
    console.log("[CompanyCreationRequest]", {
        requested_id: body.requested_id,
        company_name: body.company_name,
        fiscal_name: body.fiscal_name,
        tax_id: body.tax_id,
        user_position: body.user_position,
        company_website: body.company_website,
        country: body.country,
        description: body.description,
        requested_by: request.email,
        user_sub: request.sub,
    });
    return NextResponse.json({ message: "Request received. The platform team will review it." });
}, requestSchema, true);
