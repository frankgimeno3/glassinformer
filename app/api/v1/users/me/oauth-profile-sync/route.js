import { createEndpoint } from "../../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import Joi from "joi";
import {
    looksLikeGoogleCognitoSession,
    upsertProfileFromGoogleIdToken,
} from "../../../../../server/features/userProfile/UserProfileService.js";

export const runtime = "nodejs";

const postSchema = Joi.object({
    subscribe_portal_newsletter: Joi.boolean().optional(),
}).default({});

export const POST = createEndpoint(
    async (request, body) => {
        const claims = request.idTokenPayload;
        if (!claims) {
            return NextResponse.json({ message: "No hay token de sesión" }, { status: 401 });
        }
        if (!looksLikeGoogleCognitoSession(claims)) {
            return NextResponse.json(
                {
                    message:
                        "Esta acción solo está disponible tras iniciar sesión con Google (Hosted UI).",
                },
                { status: 400 }
            );
        }
        const profile = await upsertProfileFromGoogleIdToken(claims, {
            subscribe_portal_newsletter: body.subscribe_portal_newsletter === true,
        });
        return NextResponse.json({ ok: true, profile, authProvider: "google" });
    },
    postSchema,
    true
);
