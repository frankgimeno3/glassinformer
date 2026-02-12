import { createEndpoint } from "../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getAllProducts } from "../../../server/features/product/ProductService.js";

export const runtime = "nodejs";

export const GET = createEndpoint(async () => {
    const products = await getAllProducts();
    return NextResponse.json(products);
}, null, false);
