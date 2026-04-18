import { createEndpoint } from "../../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import Joi from "joi";
import { portal_id } from "../../../../../GlassInformerSpecificData.js";
import {
    getUserContentPreferencesForPortal,
    upsertUserContentPreference,
} from "../../../../../server/features/user_feed_preferences/UserFeedPreferenceService.js";

export const runtime = "nodejs";

const patchSchema = Joi.object({
    topic_id: Joi.number().integer().positive().required(),
    preference_state: Joi.string()
        .valid("neutral", "not interested", "very interested")
        .required(),
});

export const GET = createEndpoint(
    async (request) => {
        const email = request.email;
        if (!email) {
            return NextResponse.json({ message: "No hay sesión" }, { status: 401 });
        }
        const list = await getUserContentPreferencesForPortal(email, portal_id);
        return NextResponse.json(list);
    },
    null,
    true
);

export const PATCH = createEndpoint(
    async (request, body) => {
        const email = request.email;
        if (!email) {
            return NextResponse.json({ message: "No hay sesión" }, { status: 401 });
        }
        const updated = await upsertUserContentPreference(
            email,
            portal_id,
            body.topic_id,
            body.preference_state
        );
        return NextResponse.json(updated);
    },
    patchSchema,
    true
);
