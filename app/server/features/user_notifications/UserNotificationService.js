import UserProfileModel from "../userProfile/UserProfileModel.js";
import "../../database/models.js";
import { QueryTypes } from "sequelize";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveUserIdFromEmailStrict(email) {
    const e = String(email || "").trim();
    if (!e || !UserProfileModel.sequelize) return null;
    const user = await UserProfileModel.findOne({ where: { user_email: e } });
    if (!user?.user_id) return null;
    return String(user.user_id);
}

function mapRow(r) {
    return {
        user_notification_id: String(r.user_notification_id),
        notification_type: r.notification_type != null ? String(r.notification_type) : "",
        notification_content: r.notification_content != null ? String(r.notification_content) : "",
        notification_date: r.notification_date != null ? new Date(r.notification_date).toISOString() : null,
        notification_status: r.notification_status != null ? String(r.notification_status) : "pending",
        notification_redirection:
            r.notification_redirection != null && String(r.notification_redirection).trim() !== ""
                ? String(r.notification_redirection)
                : null,
        portal_id: r.portal_id != null && r.portal_id !== "" ? Number(r.portal_id) : null,
    };
}

/**
 * @param {string} email
 * @returns {Promise<number>}
 */
export async function getPendingNotificationCountForEmail(email) {
    const uid = await resolveUserIdFromEmailStrict(email);
    if (!uid) return 0;
    const sequelize = UserProfileModel.sequelize;
    const rows = await sequelize.query(
        `SELECT COUNT(*)::int AS c
         FROM public.user_notifications
         WHERE user_id = :uid::uuid AND notification_status = 'pending'`,
        { replacements: { uid }, type: QueryTypes.SELECT }
    );
    const row = Array.isArray(rows) && rows[0];
    const n = row?.c;
    return Number.isFinite(Number(n)) ? Number(n) : 0;
}

/**
 * @param {string} email
 * @returns {Promise<object[]>}
 */
export async function listNotificationsForEmail(email) {
    const uid = await resolveUserIdFromEmailStrict(email);
    if (!uid) return [];
    const sequelize = UserProfileModel.sequelize;
    const rows = await sequelize.query(
        `SELECT
           un.user_notification_id,
           un.notification_type,
           un.notification_content,
           un.notification_date,
           un.notification_status,
           un.notification_redirection,
           un.portal_id
         FROM public.user_notifications un
         WHERE un.user_id = :uid::uuid
         ORDER BY un.notification_date DESC NULLS LAST`,
        { replacements: { uid }, type: QueryTypes.SELECT }
    );
    return (Array.isArray(rows) ? rows : []).map(mapRow);
}

/**
 * @param {string} email
 * @param {string} notificationId
 * @returns {Promise<object|null>}
 */
export async function getNotificationForEmail(email, notificationId) {
    const nid = String(notificationId || "").trim();
    if (!UUID_RE.test(nid)) return null;
    const uid = await resolveUserIdFromEmailStrict(email);
    if (!uid) return null;
    const sequelize = UserProfileModel.sequelize;
    const rows = await sequelize.query(
        `SELECT
           un.user_notification_id,
           un.notification_type,
           un.notification_content,
           un.notification_date,
           un.notification_status,
           un.notification_redirection,
           un.portal_id
         FROM public.user_notifications un
         WHERE un.user_notification_id = :nid::uuid AND un.user_id = :uid::uuid
         LIMIT 1`,
        { replacements: { nid, uid }, type: QueryTypes.SELECT }
    );
    const row = Array.isArray(rows) && rows[0];
    return row ? mapRow(row) : null;
}

/**
 * @param {string} email
 * @param {string} notificationId
 * @returns {Promise<object|null>} updated row or null
 */
export async function markNotificationReadForEmail(email, notificationId) {
    const nid = String(notificationId || "").trim();
    if (!UUID_RE.test(nid)) return null;
    const uid = await resolveUserIdFromEmailStrict(email);
    if (!uid) return null;
    const sequelize = UserProfileModel.sequelize;
    await sequelize.query(
        `UPDATE public.user_notifications
         SET notification_status = 'read'
         WHERE user_notification_id = :nid::uuid AND user_id = :uid::uuid`,
        { replacements: { nid, uid } }
    );
    return getNotificationForEmail(email, notificationId);
}
