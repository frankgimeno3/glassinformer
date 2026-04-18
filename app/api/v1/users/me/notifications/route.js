import { createEndpoint } from "../../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { listNotificationsForEmail } from "../../../../../server/features/user_notifications/UserNotificationService.js";

export const runtime = "nodejs";

export const GET = createEndpoint(
    async (request) => {
        const email = request.email;
        if (!email) {
            return NextResponse.json({ message: "No hay sesión" }, { status: 401 });
        }
        const notifications = await listNotificationsForEmail(email);
        return NextResponse.json({ notifications });
    },
    null,
    true
);
