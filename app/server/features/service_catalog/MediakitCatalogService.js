import ServiceDbModel from "./ServiceDbModel.js";
import ServiceGroupDbModel from "./ServiceGroupDbModel.js";
import "../../database/models.js";

const serviceGroupInclude = {
    model: ServiceGroupDbModel,
    as: "service_group",
    attributes: ["service_group_id", "service_group_name", "service_group_channel"],
    required: true,
};

/**
 * @param {number} portalId — portals_db.portal_id (p. ej. Glassinformer = 1)
 * @returns {Promise<Array<{ service_id: string, service_full_name: string, service_unit_price: number, service_group_channel: string, service_group_name: string | null }>>}
 */
export async function listServicesForPortal(portalId) {
    try {
        if (!ServiceDbModel.sequelize) {
            console.warn("[MediakitCatalogService] Sequelize not initialized");
            return [];
        }
        const rows = await ServiceDbModel.findAll({
            where: { service_portal: portalId },
            include: [serviceGroupInclude],
            order: [
                ["service_full_name", "ASC"],
                ["service_id", "ASC"],
            ],
        });
        return rows.map((r) => {
            const plain = typeof r.get === "function" ? r.get({ plain: true }) : r;
            const g = plain.service_group ?? {};
            return {
                service_id: plain.service_id,
                service_full_name: plain.service_full_name ?? "",
                service_unit_price: Number(plain.service_unit_price ?? 0),
                service_group_channel: String(g.service_group_channel ?? "").toLowerCase(),
                service_group_name: g.service_group_name ?? null,
            };
        });
    } catch (error) {
        console.error("[MediakitCatalogService] listServicesForPortal:", error);
        if (
            error.name === "SequelizeConnectionError" ||
            error.name === "SequelizeConnectionRefusedError" ||
            error.message?.includes("ETIMEDOUT") ||
            error.message?.includes("ECONNREFUSED") ||
            (error.message?.includes("relation") && error.message?.includes("does not exist")) ||
            error.message?.includes("service_portal")
        ) {
            return [];
        }
        throw error;
    }
}
