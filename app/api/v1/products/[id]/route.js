import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getProductById } from "../../../../server/features/product/ProductService.js";

function getIdFromRequest(request) {
    const url = new URL(request.url);
    const match = url.pathname.match(/\/api\/v1\/products\/([^/]+)/);
    if (match && match[1]) {
        return decodeURIComponent(match[1]);
    }
    throw new Error("Product ID not found in URL");
}

export const runtime = "nodejs";

export const GET = createEndpoint(async (request) => {
    const id = getIdFromRequest(request);
    const product = await getProductById(id);
    return NextResponse.json(product);
}, null, false);
