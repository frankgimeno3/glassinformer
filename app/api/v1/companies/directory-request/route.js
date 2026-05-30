import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import Joi from "joi";
import { createDirectoryCompanyRequest } from "../../../../server/features/company/DirectoryCompanyRequestService.js";

export const runtime = "nodejs";

const bodySchema = Joi.object({
    company_name: Joi.string().trim().required(),
    country: Joi.string().trim().required(),
    main_description: Joi.string().trim().required(),
    company_website: Joi.string().trim().allow("").optional(),
    list_as_employee: Joi.boolean().default(false),
    visible_role: Joi.string().trim().allow("").optional(),
});

export const POST = createEndpoint(async (request, body) => {
    const email = request.email;
    if (!email) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const result = await createDirectoryCompanyRequest({
        requesterEmail: email,
        companyName: body.company_name,
        country: body.country,
        mainDescription: body.main_description,
        companyWebsite: body.company_website ?? "",
        listAsEmployee: Boolean(body.list_as_employee),
        visibleRole: body.visible_role ?? "",
    });
    return NextResponse.json({
        ok: true,
        ticket_id: result.ticketId,
    });
}, bodySchema, true);
