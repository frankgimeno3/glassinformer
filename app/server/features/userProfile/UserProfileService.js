import UserProfileModel from "./UserProfileModel.js";
import "../../database/models.js";

const DEFAULT_USER_CURRENT_COMPANY = { id_company: "", userPosition: "" };
const DEFAULT_EXPERIENCE_ARRAY = [];

/**
 * Crea un usuario de perfil en RDS con id_user = email y el resto de campos en blanco.
 * @param {string} id_user - Email del usuario (id en la tabla users)
 * @returns {Promise<object>} Usuario creado en formato API
 */
export async function createProfileUser(id_user) {
    if (!id_user || typeof id_user !== "string" || !id_user.trim()) {
        throw new Error("id_user (email) es obligatorio");
    }

    const email = id_user.trim();

    if (!UserProfileModel.sequelize) {
        throw new Error("UserProfileModel no inicializado. Comprueba la conexión a la base de datos.");
    }

    // Asegurar que la tabla 'users' existe (por si sync al arranque no se ejecutó en este contexto)
    await UserProfileModel.sync();

    const existing = await UserProfileModel.findByPk(email);
    if (existing) {
        return toApiFormat(existing);
    }

    const user = await UserProfileModel.create({
        id_user: email,
        user_name: "",
        user_surnames: "",
        user_description: "",
        user_main_image_src: "",
        user_current_company: DEFAULT_USER_CURRENT_COMPANY,
        experience_array: DEFAULT_EXPERIENCE_ARRAY,
    });

    return toApiFormat(user);
}

/**
 * Obtiene todos los usuarios de perfil.
 * @returns {Promise<object[]>}
 */
export async function getAllProfileUsers() {
    if (!UserProfileModel.sequelize) {
        return [];
    }
    const users = await UserProfileModel.findAll({ order: [["user_name", "ASC"]] });
    return users.map((u) => toApiFormat(u));
}

/**
 * Obtiene un usuario de perfil por id_user (email).
 * @param {string} id_user
 * @returns {Promise<object|null>}
 */
export async function getProfileUserById(id_user) {
    if (!UserProfileModel.sequelize) {
        return null;
    }
    const user = await UserProfileModel.findByPk(id_user);
    return user ? toApiFormat(user) : null;
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
    const user = await UserProfileModel.findByPk(id_user.trim());
    if (!user) {
        throw new Error("Usuario no encontrado");
    }
    const updates = {};
    if (data.userName !== undefined) updates.user_name = data.userName;
    if (data.userSurnames !== undefined) updates.user_surnames = data.userSurnames;
    if (data.userDescription !== undefined) updates.user_description = data.userDescription;
    if (data.userMainImageSrc !== undefined) updates.user_main_image_src = data.userMainImageSrc;
    if (data.userCurrentCompany !== undefined) updates.user_current_company = data.userCurrentCompany;
    if (data.experienceArray !== undefined) updates.experience_array = data.experienceArray;
    await user.update(updates);
    return toApiFormat(user);
}

function toApiFormat(user) {
    const u = user.toJSON ? user.toJSON() : user;
    return {
        id_user: u.id_user,
        userName: u.user_name ?? "",
        userSurnames: u.user_surnames ?? "",
        userDescription: u.user_description ?? "",
        userMainImageSrc: u.user_main_image_src ?? "",
        userCurrentCompany: u.user_current_company ?? DEFAULT_USER_CURRENT_COMPANY,
        experienceArray: u.experience_array ?? DEFAULT_EXPERIENCE_ARRAY,
    };
}
