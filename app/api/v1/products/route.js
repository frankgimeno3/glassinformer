import { createEndpoint } from "../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getAllProducts, createProduct } from "../../../server/features/product/ProductService.js";
import Joi from "joi";

export const runtime = "nodejs";

const createProductSchema = Joi.object({
    id_product: Joi.string().allow("").optional(),
    product_name: Joi.string().required(),
    product_description: Joi.string().allow("").optional(),
    id_company: Joi.string().required(),
    tagsArray: Joi.array().items(Joi.string()).optional(),
    price: Joi.number().allow(null).optional(),
    main_image_src: Joi.string().allow("").optional(),
});

export const GET = createEndpoint(async () => {
    const products = await getAllProducts();
    return NextResponse.json(products);
}, null, false);

export const POST = createEndpoint(async (_request, body) => {
    const product = await createProduct(body);
    return NextResponse.json(product);
}, createProductSchema, true);
