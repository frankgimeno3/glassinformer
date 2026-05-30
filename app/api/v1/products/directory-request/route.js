import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import Joi from "joi";
import { createDirectoryProductRequest } from "../../../../server/features/product/DirectoryProductRequestService.js";

export const runtime = "nodejs";

const bodySchema = Joi.object({
  company_id: Joi.string().trim().required(),
  product_name: Joi.string().trim().required(),
  product_description: Joi.string().trim().allow("").optional(),
  tags_array: Joi.array().items(Joi.string().trim()).default([]),
  price: Joi.number().min(0).allow(null).optional(),
  main_image_src: Joi.string().trim().allow("").max(2048).optional(),
});

export const POST = createEndpoint(
  async (request, body) => {
    const email = request.email;
    if (!email) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const result = await createDirectoryProductRequest({
      requesterEmail: email,
      companyId: body.company_id,
      productName: body.product_name,
      productDescription: body.product_description ?? "",
      price: body.price ?? null,
      mainImageSrc: body.main_image_src ?? "",
      tagsArray: body.tags_array ?? [],
    });

    return NextResponse.json({ ok: true, ticket_id: result.ticketId });
  },
  bodySchema,
  true
);

