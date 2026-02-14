import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import {
    getProfileUserById,
    createProfileUser,
    updateProfileUser,
} from "../../../../server/features/userProfile/UserProfileService.js";
import Joi from "joi";

export const runtime = "nodejs";

const updateSchema = Joi.object({
    userName: Joi.string().allow("").optional(),
    userSurnames: Joi.string().allow("").optional(),
    userDescription: Joi.string().allow("").optional(),
    userMainImageSrc: Joi.string().allow("").max(2048).optional(),
    userCurrentCompany: Joi.object({
        id_company: Joi.string().allow("").optional(),
        userPosition: Joi.string().allow("").optional(),
    }).optional(),
    experienceArray: Joi.array().items(Joi.object()).optional(),
}).min(1);

// GET: perfil del usuario autenticado (id_user = email de la sesión Cognito)
export const GET = createEndpoint(
    async (request) => {
        const email = request.email;
        if (!email) {
            return new Response(JSON.stringify({ message: "No hay sesión" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        let user = await getProfileUserById(email);
        if (!user) {
            user = await createProfileUser(email);
        }
        return NextResponse.json(user);
    },
    null,
    true
);

// PUT: actualizar perfil del usuario autenticado en RDS
export const PUT = createEndpoint(
    async (request, body) => {
        const email = request.email;
        if (!email) {
            return new Response(JSON.stringify({ message: "No hay sesión" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        const user = await updateProfileUser(email, body);
        return NextResponse.json(user);
    },
    updateSchema,
    true
);
