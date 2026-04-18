import BannerModel from "./BannerModel.js";
import "../../database/models.js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { normalizeBannerImageSrc } from "../../../general_components/banners/normalizeBannerImageSrc.js";
import { Op } from "sequelize";

function getFallbackBanners() {
    try {
        const jsonPath = join(process.cwd(), "app", "contents", "bannersContents.json");
        if (!existsSync(jsonPath)) {
            return [];
        }
        const fileContent = readFileSync(jsonPath, "utf-8");
        const parsed = JSON.parse(fileContent);
        return Array.isArray(parsed)
            ? parsed.map((banner) => ({
                ...banner,
                bannerSrc: normalizeBannerImageSrc(banner.bannerSrc),
            }))
            : [];
    } catch (error) {
        console.warn("Fallback banners JSON unreadable:", error.message);
        return [];
    }
}

/** Map appearance_weight (high/medium/low) to numeric priority for pickBannerByPriority; higher = more likely to be picked */
function weightToPriority(weight) {
    if (!weight) return 1;
    const w = String(weight).toLowerCase();
    if (w === "high") return 2;
    if (w === "medium") return 1;
    return 0; // low or unknown
}

function toApiFormat(row) {
    const rawStatus = String(row.banner_status ?? "").trim().toLowerCase();
    return {
        id_banner: row.id_banner ?? row.id_banner,
        bannerType: row.banner_position_type,
        bannerSrc: normalizeBannerImageSrc(row.banner_image_src),
        bannerRoute: row.banner_route ?? "/",
        bannerRedirection: row.banner_redirection_url ?? "",
        // DB: banner_appearence_weight int (0..3). UI expects 0..2 priority.
        bannerPriority: Math.max(0, Math.min(2, Number(row.banner_appearence_weight ?? 0) - 1)),
        page_type: row.banner_page_type,
        bannerStatus: rawStatus || undefined,
    };
}

export async function getAllBanners() {
    try {
        if (!BannerModel.sequelize) {
            console.warn("BannerModel not initialized, using fallback data from JSON");
            return getFallbackBanners();
        }

        const today = new Date().toISOString().slice(0, 10);
        const rows = await BannerModel.findAll({
            where: {
                banner_appearence_weight: { [Op.gt]: 0 },
                banner_starting_date: { [Op.lte]: today },
                banner_ending_date: { [Op.gte]: today },
                ...(BannerModel.rawAttributes?.banner_status
                    ? { banner_status: { [Op.in]: ["published", "active"] } }
                    : {}),
            },
            order: [
                ["banner_position_type", "ASC"],
                ["banner_appearence_weight", "DESC"],
                ["banner_position", "ASC"],
                ["banner_created_at", "ASC"],
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
