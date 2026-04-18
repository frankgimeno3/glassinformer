import UserProfileModel from "../userProfile/UserProfileModel.js";
import "../../database/models.js";
import { QueryTypes } from "sequelize";
import { getProfileUserByEmail, createProfileUser } from "../userProfile/UserProfileService.js";

/** Matches CHECK on public.user_feed_preferences.preference_state */
const ALLOWED_STATES = new Set(["neutral", "not interested", "very interested"]);

async function resolveUserIdFromEmail(email) {
    const e = String(email || "").trim();
    if (!e) {
        throw new Error("Email requerido");
    }
    let profile = await getProfileUserByEmail(e);
    if (!profile) {
        profile = await createProfileUser(e);
    }
    const id = profile?.id_user;
    if (!id || typeof id !== "string") {
        throw new Error("No se pudo resolver user_id");
    }
    return id;
}

/**
 * Temas del portal y preferencia del usuario (LEFT JOIN; sin fila aún → neutral).
 * @param {string} email
 * @param {number} portalId — portals_db.portal_id
 */
export async function getUserContentPreferencesForPortal(email, portalId) {
    if (!UserProfileModel.sequelize) {
        throw new Error("Base de datos no disponible");
    }
    const userId = await resolveUserIdFromEmail(email);
    const sequelize = UserProfileModel.sequelize;
    const rows = await sequelize.query(
        `
        SELECT
          t.topic_id,
          t.topic_name,
          t.topic_description,
          p.user_feed_preference_id,
          COALESCE(p.preference_state, 'neutral'::character varying) AS preference_state
        FROM public.topic_portals AS tp
        JOIN public.topics_db AS t
          ON t.topic_id = tp.topic_id
        LEFT JOIN public.user_feed_preferences AS p
          ON p.topic_id = t.topic_id AND p.user_id = :userId
        WHERE tp.portal_id = :portalId
        ORDER BY t.topic_name ASC
        `,
        {
            replacements: { userId, portalId },
            type: QueryTypes.SELECT,
        }
    );
    return (Array.isArray(rows) ? rows : []).map((r) => ({
        topic_id: Number(r.topic_id),
        topic_name: r.topic_name != null ? String(r.topic_name) : "",
        topic_description: r.topic_description != null ? String(r.topic_description) : "",
        user_feed_preference_id: r.user_feed_preference_id != null ? String(r.user_feed_preference_id) : null,
        preference_state: normalizeStateFromDb(r.preference_state),
    }));
}

function normalizeStateFromDb(raw) {
    const s = raw != null ? String(raw).trim() : "neutral";
    if (ALLOWED_STATES.has(s)) return s;
    return "neutral";
}

/**
 * Inserta o actualiza la preferencia en RDS (UPSERT por user_id + topic_id).
 * @param {string} email
 * @param {number} portalId
 * @param {number} topicId
 * @param {string} preferenceState — 'neutral' | 'not interested' | 'very interested'
 */
export async function upsertUserContentPreference(email, portalId, topicId, preferenceState) {
    if (!UserProfileModel.sequelize) {
        throw new Error("Base de datos no disponible");
    }
    const state = preferenceState != null ? String(preferenceState).trim() : "";
    if (!ALLOWED_STATES.has(state)) {
        throw new Error("Invalid preference_state");
    }
    const tid = Number(topicId);
    if (!Number.isInteger(tid) || tid < 1) {
        throw new Error("Invalid topic_id");
    }
    const userId = await resolveUserIdFromEmail(email);
    const sequelize = UserProfileModel.sequelize;

    const [topicRow] = await sequelize.query(
        `
        SELECT tp.topic_id
        FROM public.topic_portals tp
        WHERE tp.topic_id = :topicId AND tp.portal_id = :portalId
        LIMIT 1
        `,
        { replacements: { topicId: tid, portalId }, type: QueryTypes.SELECT }
    );
    if (!topicRow) {
        throw new Error("Topic not found for this portal");
    }

    await sequelize.query(
        `
        INSERT INTO public.user_feed_preferences (user_id, topic_id, preference_state)
        VALUES (:userId, :topicId, :preferenceState)
        ON CONFLICT (user_id, topic_id)
        DO UPDATE SET preference_state = EXCLUDED.preference_state
        `,
        { replacements: { userId, topicId: tid, preferenceState: state } }
    );

    return { topic_id: tid, preference_state: state };
}
