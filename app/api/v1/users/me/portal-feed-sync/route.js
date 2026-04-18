import { createEndpoint } from "../../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import Joi from "joi";
import { syncPortalFirstLoginForSessionUser } from "../../../../../server/features/userProfile/UserProfileService.js";

export const runtime = "nodejs";

const postSchema = Joi.object({}).default({});

export const POST = createEndpoint(
    async (request) => {
        const email = request.email;
        if (!email) {
            return NextResponse.json({ message: "No hay sesión" }, { status: 401 });
        }
        const result = await syncPortalFirstLoginForSessionUser(email);
        return NextResponse.json(result);
    },
    postSchema,
    true
);
