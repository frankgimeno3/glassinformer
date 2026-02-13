import { createEndpoint } from "../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { getAllBanners } from "../../../server/features/banner/BannerService.js";

export const runtime = "nodejs";

export const GET = createEndpoint(async () => {
    const banners = await getAllBanners();
    return NextResponse.json(banners);
}, null, false);
