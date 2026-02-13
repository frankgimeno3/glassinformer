import BannerModel from "./BannerModel.js";
import "../../database/models.js";
import { readFileSync } from "fs";
import { join } from "path";

function getFallbackBanners() {
    try {
        const jsonPath = join(process.cwd(), "app", "contents", "bannersContents.json");
        const fileContent = readFileSync(jsonPath, "utf-8");
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Error reading fallback banners from JSON:", error);
        return [];
    }
}

function toApiFormat(row) {
    return {
        id_banner: row.id,
        bannerType: row.position_type,
        bannerSrc: row.src,
        bannerRoute: row.route ?? "/",
        bannerRedirection: row.banner_redirection ?? "",
        bannerPriority: row.position ?? 0,
        page_type: row.page_type,
    };
}

export async function getAllBanners() {
    try {
        if (!BannerModel.sequelize) {
            console.warn("BannerModel not initialized, using fallback data from JSON");
            return getFallbackBanners();
        }

        const rows = await BannerModel.findAll({
            order: [
                ["position_type", "ASC"],
                ["position", "ASC"],
            ],
        });

        if (!rows || rows.length === 0) {
            console.warn("Banners table empty, using fallback data from JSON");
            return getFallbackBanners();
        }

        return rows.map((row) => toApiFormat(row));
    } catch (error) {
        console.error("Error fetching banners from database:", error);
        if (
            error.name === "SequelizeConnectionError" ||
            error.name === "SequelizeDatabaseError" ||
            error.name === "SequelizeConnectionRefusedError" ||
            error.message?.includes("ETIMEDOUT") ||
            error.message?.includes("ECONNREFUSED") ||
            (error.message?.includes("relation") && error.message?.includes("does not exist")) ||
            error.message?.includes("not initialized") ||
            error.message?.includes("Model not found")
        ) {
            console.warn("Database connection issue, using fallback data from JSON");
            return getFallbackBanners();
        }
        throw error;
    }
}
