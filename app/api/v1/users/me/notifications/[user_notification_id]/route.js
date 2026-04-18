import { createEndpoint } from "../../../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import Joi from "joi";
import {
    getNotificationForEmail,
    markNotificationReadForEmail,
} from "../../../../../../server/features/user_notifications/UserNotificationService.js";

export const runtime = "nodejs";

async function getNotificationId(context) {
    const params = context?.params != null ? await Promise.resolve(context.params) : null;
    const raw = params?.user_notification_id;
    if (raw != null && typeof raw === "string" && raw.trim()) {
        return raw.trim();
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

const patchSchema = Joi.object({}).default({});

export const PATCH = createEndpoint(
    async (request, _body, context) => {
        const email = request.email;
        if (!email) {
            return NextResponse.json({ message: "No hay sesión" }, { status: 401 });
        }
        const user_notification_id = await getNotificationId(context);
        const updated = await markNotificationReadForEmail(email, user_notification_id);
        if (!updated) {
            return NextResponse.json({ message: "Notificación no encontrada" }, { status: 404 });
        }
        return NextResponse.json(updated);
    },
    patchSchema,
    true
);
