import { createEndpoint } from "../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { createProfileUser, getAllProfileUsers } from "../../../server/features/userProfile/UserProfileService.js";
import Joi from "joi";

export const runtime = "nodejs";

// GET: listar todos los usuarios de perfil. Público.
export const GET = createEndpoint(async () => {
    const users = await getAllProfileUsers();
    return NextResponse.json(users);
}, null, true);

// POST: crear usuario de perfil en RDS (id_user = email). Público, se usa tras el signup en Cognito.
export const POST = createEndpoint(
    async (request, body) => {
        const user = await createProfileUser(body.id_user);
        return NextResponse.json(user);
    },
    Joi.object({
        id_user: Joi.string().email().required(),
    }),
    false
);
