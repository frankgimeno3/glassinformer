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
