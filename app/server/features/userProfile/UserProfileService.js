import UserProfileModel from "./UserProfileModel.js";
import "../../database/models.js";
import { QueryTypes } from "sequelize";
import { portal_id, signupAlwaysNewsletterListIds } from "../../../GlassInformerSpecificData.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * All `newsletter_user_lists` rows for this portal whose resolved type is `main`
 * (`newsletter_list_type` when present, else first linked `newsletter_campaigns.newsletter_type`).
 * @param {import("sequelize").Sequelize} sequelize
 * @param {number} portalIdNum
 * @returns {Promise<string[]>}
 */
async function getMainNewsletterListIdsForPortal(sequelize, portalIdNum) {
    const pid = Number(portalIdNum);
    if (!Number.isInteger(pid) || pid < 0) return [];

    try {
        const hasListTypeCol = await sequelize.query(
            `SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'newsletter_user_lists'
               AND column_name = 'newsletter_list_type' LIMIT 1`,
            { type: QueryTypes.SELECT }
        );
        const useCol = Array.isArray(hasListTypeCol) && hasListTypeCol.length > 0;

        const lateral = `
LEFT JOIN LATERAL (
  SELECT c.newsletter_type
  FROM public.newsletter_campaigns c
  WHERE c.newsletter_user_lists_id_array @> ARRAY[nul.newsletter_user_list_id]::uuid[]
  ORDER BY c.newsletter_campaign_id ASC
  LIMIT 1
) camp ON true`;

        let rows;
        if (useCol) {
            rows = await sequelize.query(
                `SELECT nul.newsletter_user_list_id AS id
                 FROM public.newsletter_user_lists nul
                 ${lateral}
                 WHERE nul.user_list_portal = :pid
                   AND COALESCE(nul.newsletter_list_type, camp.newsletter_type, 'specific') = 'main'`,
                { replacements: { pid }, type: QueryTypes.SELECT }
            );
        } else {
            rows = await sequelize.query(
                `SELECT nul.newsletter_user_list_id AS id
                 FROM public.newsletter_user_lists nul
                 ${lateral}
                 WHERE nul.user_list_portal = :pid
                   AND camp.newsletter_type = 'main'`,
                { replacements: { pid }, type: QueryTypes.SELECT }
            );
        }
        const list = Array.isArray(rows) ? rows : [];
        return [...new Set(list.map((r) => String(r.id || "").trim()).filter((id) => UUID_RE.test(id)))];
    } catch (e) {
        console.warn("[newsletter] getMainNewsletterListIdsForPortal failed:", e?.message || e);
        return [];
    }
}

/**
 * Subscribes `userId` to each list in `listIds` (RDS). Best-effort; idempotent.
 * Uses `user_list_subscriptions` when present; else legacy `list_user_ids_array` on `newsletter_user_lists`.
 * @param {string} userId - users_db.user_id (UUID)
 * @param {string[]} listIds - newsletter_user_list_id values
 */
export async function subscribeUserToNewsletterListIds(userId, listIds) {
    if (!UserProfileModel.sequelize) return;
    const uid = String(userId || "").trim();
    const ids = [
        ...new Set(
            (listIds || [])
                .map((x) => String(x || "").trim())
                .filter((id) => UUID_RE.test(id))
        ),
    ];
    if (!uid || !UUID_RE.test(uid) || ids.length === 0) return;

    const sequelize = UserProfileModel.sequelize;

    try {
        const hasSubsTable = await sequelize.query(
            `SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'user_list_subscriptions' LIMIT 1`,
            { type: QueryTypes.SELECT }
        );
        const hasSubs = Array.isArray(hasSubsTable) && hasSubsTable.length > 0;

        const hasLegacyCol = await sequelize.query(
            `SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'newsletter_user_lists'
               AND column_name = 'list_user_ids_array' LIMIT 1`,
            { type: QueryTypes.SELECT }
        );
        const hasLegacy = Array.isArray(hasLegacyCol) && hasLegacyCol.length > 0;

        for (const list_id of ids) {
            if (hasSubs) {
                await sequelize.query(
                    `INSERT INTO public.user_list_subscriptions (user_id, newsletter_user_list_id)
                     VALUES (:uid::uuid, :list_id::uuid)
                     ON CONFLICT (user_id, newsletter_user_list_id) DO NOTHING`,
                    { replacements: { uid, list_id } }
                );
            } else if (hasLegacy) {
                await sequelize.query(
                    `UPDATE public.newsletter_user_lists
                     SET list_user_ids_array =
                       CASE
                         WHEN :uid::uuid = ANY(list_user_ids_array) THEN list_user_ids_array
                         ELSE array_append(list_user_ids_array, :uid::uuid)
                       END
                     WHERE newsletter_user_list_id = :list_id::uuid`,
                    { replacements: { uid, list_id } }
                );
            }
        }

        if (!hasSubs && !hasLegacy) {
            console.warn(
                "[newsletter] Cannot subscribe: no user_list_subscriptions table and no list_user_ids_array column."
            );
            return;
        }

        const hasUserListCol = await sequelize.query(
            `SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'users_db'
               AND column_name = 'newsletter_user_lists_id_array' LIMIT 1`,
            { type: QueryTypes.SELECT }
        );
        if (Array.isArray(hasUserListCol) && hasUserListCol.length > 0) {
            for (const list_id of ids) {
                await sequelize.query(
                    `UPDATE public.users_db
                     SET newsletter_user_lists_id_array =
                       CASE
                         WHEN :list_id::uuid = ANY(newsletter_user_lists_id_array) THEN newsletter_user_lists_id_array
                         ELSE array_append(newsletter_user_lists_id_array, :list_id::uuid)
                       END
                     WHERE user_id = :uid::uuid`,
                    { replacements: { uid, list_id } }
                );
            }
        }
    } catch (e) {
        console.warn("[newsletter] subscribeUserToNewsletterListIds failed:", e?.message || e);
    }
}

/**
 * Subscribes a users_db row to every "main" newsletter list for this portal (from `newsletter_user_lists` + type resolution).
 * @param {string} userId - users_db.user_id (UUID)
 * @param {number} portalIdNum - portals_db.portal_id (from portal-specific config)
 */
export async function subscribeUserToPortalMainNewsletterList(userId, portalIdNum) {
    if (!UserProfileModel.sequelize) return;
    const uid = String(userId || "").trim();
    const pid = Number(portalIdNum);
    if (!uid || !Number.isInteger(pid) || pid < 0) return;

    const mainIds = await getMainNewsletterListIdsForPortal(UserProfileModel.sequelize, pid);
    if (mainIds.length === 0) {
        console.warn("[newsletter] No main newsletter lists for portal", pid);
        return;
    }
    await subscribeUserToNewsletterListIds(uid, mainIds);
}

const DEFAULT_USER_CURRENT_COMPANY = { id_company: "", userPosition: "" };
const DEFAULT_EXPERIENCE_ARRAY = [];
const DEFAULT_PREFERENCES = {
    userCurrentCompany: DEFAULT_USER_CURRENT_COMPANY,
    experienceArray: DEFAULT_EXPERIENCE_ARRAY,
};

function safePreferences(raw) {
    if (!raw || typeof raw !== "object") return { ...DEFAULT_PREFERENCES };
    const obj = raw;
    const prefs = {
        userCurrentCompany: obj.userCurrentCompany ?? DEFAULT_USER_CURRENT_COMPANY,
        experienceArray: obj.experienceArray ?? DEFAULT_EXPERIENCE_ARRAY,
    };
    if (!prefs.userCurrentCompany || typeof prefs.userCurrentCompany !== "object") {
        prefs.userCurrentCompany = DEFAULT_USER_CURRENT_COMPANY;
    }
    if (!Array.isArray(prefs.experienceArray)) {
        prefs.experienceArray = DEFAULT_EXPERIENCE_ARRAY;
    }
    return prefs;
}

function randomUuid() {
    // Node 18+ has global crypto.randomUUID().
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
        return globalThis.crypto.randomUUID();
    }
    // Fallback (very unlikely in this runtime) to a simple UUID v4-ish.
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

async function publicTableHasColumn(sequelize, tableName, columnName) {
    const rows = await sequelize.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = :table AND column_name = :col LIMIT 1`,
        {
            replacements: { table: String(tableName || ""), col: String(columnName || "") },
            type: QueryTypes.SELECT,
        }
    );
    return Array.isArray(rows) && rows.length > 0;
}

/**
 * One welcome row per user+portal (`notification_type` = welcome_portal), only if `user_notifications.portal_id` exists.
 * @param {import("sequelize").Sequelize} sequelize
 * @param {string} userId
 * @param {number} portalId
 * @param {import("sequelize").Transaction} transaction
 */
async function insertWelcomePortalNotification(sequelize, userId, portalId, transaction) {
    const hasPortalCol = await publicTableHasColumn(sequelize, "user_notifications", "portal_id");
    if (!hasPortalCol) return;

    await sequelize.query(
        `INSERT INTO public.user_notifications (
           user_id,
           notification_type,
           notification_content,
           portal_id
         )
         SELECT :userId::uuid,
                'welcome_portal',
                'This is a welcome notification example. This will include the user tutorial for portal ' ||
                COALESCE(
                  (SELECT p.portal_name FROM public.portals_db p WHERE p.portal_id = :portalId::integer LIMIT 1),
                  'portal ' || CAST(:portalId AS TEXT)
                ),
                :portalId::integer
         WHERE NOT EXISTS (
           SELECT 1 FROM public.user_notifications n
           WHERE n.user_id = :userId::uuid
             AND n.portal_id = :portalId::integer
             AND n.notification_type = 'welcome_portal'
         )`,
        { replacements: { userId, portalId }, transaction }
    );
}

/**
 * Inserts neutral `user_feed_preferences` for every topic linked to the portal via `topic_portals`.
 * @param {string} userId
 * @param {number} portalId
 * @param {import("sequelize").Transaction} [transaction]
 */
async function ensureNeutralPreferencesForPortal(userId, portalId, transaction) {
    if (!UserProfileModel.sequelize) {
        throw new Error("Base de datos no disponible");
    }
    const uid = String(userId || "").trim();
    const pid = Number(portalId);
    if (!uid) throw new Error("userId requerido");
    if (!Number.isInteger(pid) || pid < 0) throw new Error("portalId inválido");

    const sequelize = UserProfileModel.sequelize;
    await sequelize.query(
        `
        INSERT INTO public.user_feed_preferences (user_id, topic_id, preference_state)
        SELECT :userId::uuid, tp.topic_id, 'neutral'::character varying
        FROM public.topic_portals tp
        WHERE tp.portal_id = :portalId
        ON CONFLICT (user_id, topic_id) DO NOTHING
        `,
        { replacements: { userId: uid, portalId: pid }, transaction }
    );
}

/**
 * If `users_db.user_hasslogged_array` does not yet contain `portalId`, inserts neutral feed prefs
 * for all `topic_portals` topics of that portal, then appends `portalId` to the array.
 * When the column is missing (pre-migration), only runs the neutral insert (legacy behavior).
 * @param {string} userId
 * @param {number} portalId
 */
export async function assignNeutralTopicsAndMarkPortalLogged(userId, portalId) {
    if (!UserProfileModel.sequelize) return;
    const sequelize = UserProfileModel.sequelize;
    const uid = String(userId || "").trim();
    const pid = Number(portalId);
    if (!UUID_RE.test(uid) || !Number.isInteger(pid) || pid < 0) return;

    const hasLoggedCol = await publicTableHasColumn(sequelize, "users_db", "user_hasslogged_array");
    if (!hasLoggedCol) {
        await ensureNeutralPreferencesForPortal(uid, pid);
        return;
    }

    await sequelize.transaction(async (t) => {
        const locked = await sequelize.query(
            `SELECT COALESCE(user_hasslogged_array, '{}'::integer[]) AS arr
             FROM public.users_db WHERE user_id = :uid::uuid FOR UPDATE`,
            { replacements: { uid }, transaction: t, type: QueryTypes.SELECT }
        );
        const row = Array.isArray(locked) && locked[0];
        if (!row) return;
        const rawArr = row.arr;
        const arr = Array.isArray(rawArr) ? rawArr.map((x) => Number(x)) : [];
        if (arr.includes(pid)) return;

        await ensureNeutralPreferencesForPortal(uid, pid, t);
        await insertWelcomePortalNotification(sequelize, uid, pid, t);
        await sequelize.query(
            `UPDATE public.users_db
             SET user_hasslogged_array = array_append(COALESCE(user_hasslogged_array, '{}'::integer[]), :portalId::integer)
             WHERE user_id = :uid::uuid
               AND NOT (:portalId::integer = ANY(COALESCE(user_hasslogged_array, '{}'::integer[])))`,
            { replacements: { uid, portalId: pid }, transaction: t }
        );
    });
}

/**
 * After Cognito login: bootstrap feed prefs once per portal (see `user_hasslogged_array`).
 * @param {string} email - Session email
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
export async function syncPortalFirstLoginForSessionUser(email) {
    const e = String(email || "").trim();
    if (!e) return { ok: false, reason: "no_email" };
    const existing = await UserProfileModel.findOne({ where: { user_email: e } });
    if (!existing?.user_id) return { ok: false, reason: "no_user" };
    await assignNeutralTopicsAndMarkPortalLogged(String(existing.user_id), portal_id);
    return { ok: true };
}

/**
 * @param {object} claims - Payload decodificado del idToken de Cognito
 * @returns {{ email: string, sub: string, user_name: string, user_surnames: string, picture: string }}
 */
function profileFieldsFromIdTokenClaims(claims) {
    const emailRaw = claims?.email ?? claims?.["cognito:username"] ?? "";
    const email = String(emailRaw).trim();
    const sub = String(claims?.sub ?? "").trim();
    const given = String(claims?.given_name ?? "").trim();
    const family = String(claims?.family_name ?? "").trim();
    const fullName = String(claims?.name ?? "").trim();
    let user_name = given;
    let user_surnames = family;
    if (!user_name && fullName) {
        const parts = fullName.split(/\s+/).filter(Boolean);
        user_name = parts[0] || "";
        user_surnames = parts.slice(1).join(" ") || "";
    }
    const picture = String(claims?.picture ?? "")
        .trim()
        .slice(0, 2048);
    return { email, sub, user_name, user_surnames, picture };
}

/**
 * Cognito suele incluir `identities` con providerName Google en sesiones federadas.
 * @param {object} claims
 * @returns {boolean}
 */
export function isGoogleFederatedIdToken(claims) {
    const identities = claims?.identities;
    if (!Array.isArray(identities) || identities.length === 0) return false;
    return identities.some((i) => String(i?.providerName ?? "").toLowerCase() === "google");
}

/**
 * Heurística si el claim `identities` no viene en el token (según mapeo del User Pool).
 * @param {object} claims
 * @returns {boolean}
 */
export function looksLikeGoogleCognitoSession(claims) {
    if (isGoogleFederatedIdToken(claims)) return true;
    const u = String(claims?.["cognito:username"] ?? "");
    if (u.startsWith("Google_")) return true;
    return false;
}

/**
 * Crea o actualiza fila en `users_db` tras OAuth Google (misma clave de negocio: email).
 * Actualiza `user_cognito_sub`, nombre y avatar cuando aporta valor sin pisar datos ya rellenados por el usuario salvo sub/imagen desde Google.
 * `auth_provider` en Cognito queda reflejado en el token (`identities`); no hay columna dedicada en RDS en el esquema actual.
 *
 * @param {object} claims - idToken payload
 * @param {{ subscribe_portal_newsletter?: boolean }} [options]
 * @returns {Promise<object>}
 */
export async function upsertProfileFromGoogleIdToken(claims, options = {}) {
    const { email, sub, user_name, user_surnames, picture } = profileFieldsFromIdTokenClaims(claims);
    if (!email) {
        throw new Error("El token no incluye email");
    }
    if (!sub) {
        throw new Error("El token no incluye sub");
    }
    if (!UserProfileModel.sequelize) {
        throw new Error("UserProfileModel no inicializado. Comprueba la conexión a la base de datos.");
    }

    const subscribe = options.subscribe_portal_newsletter === true;
    const alwaysListIds = Array.isArray(signupAlwaysNewsletterListIds)
        ? signupAlwaysNewsletterListIds.map((x) => String(x || "").trim()).filter((id) => UUID_RE.test(id))
        : [];

    const existing = await UserProfileModel.findOne({ where: { user_email: email } });
    if (existing) {
        const updates = {};
        if (sub) {
            updates.user_cognito_sub = sub;
        }
        if (picture && !String(existing.user_main_image_src || "").trim()) {
            updates.user_main_image_src = picture;
        }
        if (user_name && !String(existing.user_name || "").trim()) {
            updates.user_name = user_name;
        }
        if (user_surnames && !String(existing.user_surnames || "").trim()) {
            updates.user_surnames = user_surnames;
        }
        if (Object.keys(updates).length > 0) {
            await existing.update(updates);
        }
        await assignNeutralTopicsAndMarkPortalLogged(String(existing.user_id), portal_id);
        if (alwaysListIds.length > 0) {
            await subscribeUserToNewsletterListIds(existing.user_id, alwaysListIds);
        }
        if (subscribe) {
            await subscribeUserToPortalMainNewsletterList(existing.user_id, portal_id);
        }
        await existing.reload();
        return toApiFormat(existing, { includeEmail: true });
    }

    const user = await UserProfileModel.create({
        user_id: randomUuid(),
        user_email: email,
        user_name: user_name || "",
        user_surnames: user_surnames || "",
        user_description: "",
        user_main_image_src: picture || "",
        user_cognito_sub: sub,
    });

    await assignNeutralTopicsAndMarkPortalLogged(String(user.user_id), portal_id);
    if (alwaysListIds.length > 0) {
        await subscribeUserToNewsletterListIds(user.user_id, alwaysListIds);
    }
    if (subscribe) {
        await subscribeUserToPortalMainNewsletterList(user.user_id, portal_id);
    }

    return toApiFormat(user, { includeEmail: true });
}

/**
 * Crea un usuario en `users_db` (si no existe) y asegura preferencias iniciales
 * en `user_feed_preferences` para los topics del portal (neutral).
 * @param {string} email - Email del usuario
 * @param {{ subscribe_portal_newsletter?: boolean }} [options]
 * @returns {Promise<object>} Usuario creado en formato API
 */
export async function createProfileUser(emailInput, options = {}) {
    if (!emailInput || typeof emailInput !== "string" || !emailInput.trim()) {
        throw new Error("email es obligatorio");
    }

    const email = emailInput.trim();

    if (!UserProfileModel.sequelize) {
        throw new Error("UserProfileModel no inicializado. Comprueba la conexión a la base de datos.");
    }

    const subscribe = options.subscribe_portal_newsletter === true;

    const alwaysListIds = Array.isArray(signupAlwaysNewsletterListIds)
        ? signupAlwaysNewsletterListIds.map((x) => String(x || "").trim()).filter((id) => UUID_RE.test(id))
        : [];

    const existing = await UserProfileModel.findOne({ where: { user_email: email } });
    if (existing) {
        await assignNeutralTopicsAndMarkPortalLogged(String(existing.user_id), portal_id);
        if (alwaysListIds.length > 0) {
            await subscribeUserToNewsletterListIds(existing.user_id, alwaysListIds);
        }
        if (subscribe) {
            await subscribeUserToPortalMainNewsletterList(existing.user_id, portal_id);
        }
        return toApiFormat(existing, { includeEmail: true });
    }

    const user = await UserProfileModel.create({
        user_id: randomUuid(),
        user_email: email,
        user_name: "",
        user_surnames: "",
        user_description: "",
        user_main_image_src: "",
    });

    await assignNeutralTopicsAndMarkPortalLogged(String(user.user_id), portal_id);

    if (alwaysListIds.length > 0) {
        await subscribeUserToNewsletterListIds(user.user_id, alwaysListIds);
    }
    if (subscribe) {
        await subscribeUserToPortalMainNewsletterList(user.user_id, portal_id);
    }

    return toApiFormat(user, { includeEmail: true });
}

/**
 * Obtiene todos los usuarios de perfil del portal actual.
 * Filtra usuarios cuya empresa actual pertenece al portal, o que no tienen empresa asignada.
 * @returns {Promise<object[]>}
 */
export async function getAllProfileUsers() {
    if (!UserProfileModel.sequelize) {
        return [];
    }
    let idsInPortal = new Set();
    try {
        const companyIds = await UserProfileModel.sequelize.query(
            `SELECT company_id FROM public.company_portals WHERE portal_id = :portalId`,
            { replacements: { portalId: portal_id }, type: QueryTypes.SELECT }
        );
        idsInPortal = new Set((companyIds || []).map((r) => r.company_id));
    } catch {
        // Si company_portals no existe, mostramos todos los usuarios
    }
    const users = await UserProfileModel.findAll({ order: [["user_name", "ASC"]] });
    const filtered = users.filter((u) => {
        if (idsInPortal.size === 0) return true;
        const prefs = safePreferences(u.user_preferences);
        const uc = prefs.userCurrentCompany || {};
        const cid = uc && uc.id_company ? String(uc.id_company).trim() : "";
        return !cid || idsInPortal.has(cid);
    });
    return filtered.map((u) => toApiFormat(u, { includeEmail: false }));
}

/**
 * Obtiene un usuario de perfil por id_user (email).
 * @param {string} id_user
 * @returns {Promise<object|null>}
 */
export async function getProfileUserByEmail(email) {
    if (!UserProfileModel.sequelize) {
        return null;
    }
    const e = String(email || "").trim();
    if (!e) return null;
    const user = await UserProfileModel.findOne({ where: { user_email: e } });
    return user ? toApiFormat(user, { includeEmail: true }) : null;
}

/** Public profile lookup: uses users_db.user_id (UUID). */
export async function getProfileUserById(userId) {
    if (!UserProfileModel.sequelize) return null;
    const id = String(userId || "").trim();
    if (!id) return null;
    const user = await UserProfileModel.findOne({ where: { user_id: id } });
    return user ? toApiFormat(user, { includeEmail: false }) : null;
}

/**
 * Actualiza el perfil de un usuario por id_user (email).
 * @param {string} id_user - Email del usuario (debe coincidir con sesión)
 * @param {object} data - Campos en formato API: userName, userSurnames, userDescription, userMainImageSrc, userCurrentCompany, experienceArray
 * @returns {Promise<object>} Perfil actualizado en formato API
 */
export async function updateProfileUser(id_user, data) {
    if (!id_user || typeof id_user !== "string" || !id_user.trim()) {
        throw new Error("id_user (email) es obligatorio");
    }
    if (!UserProfileModel.sequelize) {
        throw new Error("UserProfileModel no inicializado.");
    }
    const email = id_user.trim();
    const user = await UserProfileModel.findOne({ where: { user_email: email } });
    if (!user) {
        throw new Error("Usuario no encontrado");
    }
    const updates = {};
    if (data.userName !== undefined) updates.user_name = data.userName;
    if (data.userSurnames !== undefined) updates.user_surnames = data.userSurnames;
    if (data.userDescription !== undefined) updates.user_description = data.userDescription;
    if (data.userMainImageSrc !== undefined) updates.user_main_image_src = data.userMainImageSrc;
    if (data.userLinkedinProfile !== undefined) updates.user_linkedin_profile = data.userLinkedinProfile;

    // user_preferences column removed from users_db (migration 082); company/experience are API defaults only.
    await user.update(updates);
    return toApiFormat(user, { includeEmail: true });
}

function toApiFormat(user, options = { includeEmail: false }) {
    const u = user.toJSON ? user.toJSON() : user;
    const prefs = safePreferences(u.user_preferences);
    const includeEmail = options?.includeEmail === true;
    return {
        // Public identifier for profile URLs (do not expose email in URLs).
        id_user: u.user_id,
        ...(includeEmail ? { userEmail: u.user_email ?? "" } : {}),
        userName: u.user_name ?? "",
        userSurnames: u.user_surnames ?? "",
        userDescription: u.user_description ?? "",
        userMainImageSrc: u.user_main_image_src ?? "",
        userLinkedinProfile: u.user_linkedin_profile ?? "",
        userCurrentCompany: prefs.userCurrentCompany ?? DEFAULT_USER_CURRENT_COMPANY,
        experienceArray: prefs.experienceArray ?? DEFAULT_EXPERIENCE_ARRAY,
    };
}
