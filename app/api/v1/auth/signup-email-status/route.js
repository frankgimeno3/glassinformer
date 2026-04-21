import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { isCognitoUsernameRegistered } from "../../../../server/features/user/UserSerivce.js";
import { getProfileUserByEmail } from "../../../../server/features/userProfile/UserProfileService.js";
import Joi from "joi";

export const runtime = "nodejs";

/**
 * True if this email should not go through signup as a new user: Cognito username exists
 * and/or a profile row exists in RDS. Cognito Admin errors are non-fatal so the client still
 * gets 200 (duplicate is enforced again at signUp if needed).
 */
async function isEmailRegisteredForSignup(emailRaw) {
    const email = String(emailRaw || "").trim();
    let inCognito = false;
    let cognitoFailed = false;
    try {
        inCognito = await isCognitoUsernameRegistered(email);
    } catch (e) {
        cognitoFailed = true;
        console.warn("[signup-email-status] Cognito check failed:", e?.name, e?.message);
    }
    if (inCognito) {
        return true;
    }

    const profile = await getProfileUserByEmail(email);
    if (profile) {
        return true;
    }

    if (cognitoFailed) {
        console.warn(
            "[signup-email-status] No RDS profile; Cognito check failed — client may rely on signUp duplicate handling."
        );
    }
    return false;
}

// GET: public pre-check before signup wizard step 2.
export const GET = createEndpoint(
    async (request, query) => {
        const emailRegistered = await isEmailRegisteredForSignup(query.email);
        return NextResponse.json({ emailRegistered });
    },
    Joi.object({
        email: Joi.string().email().required(),
    }),
    false
);
