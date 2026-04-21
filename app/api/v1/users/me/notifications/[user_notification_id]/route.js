import { createEndpoint } from "../../../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import Joi from "joi";
import {
    getNotificationForEmail,
    markNotificationPendingForEmail,
    markNotificationReadForEmail,
} from "../../../../../../server/features/user_notifications/UserNotificationService.js";

export const runtime = "nodejs";

async function getNotificationId(context) {
    const params = context?.params != null ? await Promise.resolve(context.params) : null;
    const raw = params?.user_notification_id;
    const id = Array.isArray(raw) ? raw[0] : raw;
    if (id != null && typeof id === "string" && id.trim()) {
        return id.trim();
    }
    throw new Error("Missing notification id");
}

export const GET = createEndpoint(
    async (request, _body, context) => {
        const email = request.email;
        if (!email) {
            return NextResponse.json({ message: "No hay sesión" }, { status: 401 });
        }
        const user_notification_id = await getNotificationId(context);
        const row = await getNotificationForEmail(email, user_notification_id);
        if (!row) {
            return NextResponse.json({ message: "Notificación no encontrada" }, { status: 404 });
        }
        return NextResponse.json(row);
    },
    null,
    true
);

const patchSchema = Joi.object({
    notification_status: Joi.string().valid("read", "pending").optional(),
}).default({});

export const PATCH = createEndpoint(
    async (request, body, context) => {
        const email = request.email;
        if (!email) {
            return NextResponse.json({ message: "No hay sesión" }, { status: 401 });
        }
        const user_notification_id = await getNotificationId(context);
        const want = body?.notification_status;
        const updated =
            want === "pending"
                ? await markNotificationPendingForEmail(email, user_notification_id)
                : await markNotificationReadForEmail(email, user_notification_id);
        if (!updated) {
            return NextResponse.json({ message: "Notificación no encontrada" }, { status: 404 });
        }
        return NextResponse.json(updated);
    },
    patchSchema,
    true
);
