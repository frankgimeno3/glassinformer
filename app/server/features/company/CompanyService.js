import CompanyModel from "./CompanyModel.js";
import ProductModel from "../product/ProductModel.js";
import { mapProductToApiFormat } from "../product/ProductService.js";
import "../../database/models.js";
import { QueryTypes } from "sequelize";
import { portal_id } from "../../../GlassInformerSpecificData.js";

function mapCompanyToApiFormat(company, products = [], options = { includeProducts: false }) {
    const plain = company.get ? company.get({ plain: true }) : company;
    // Workers from RDS workers_array (add column + field in models.js when ready). Until then, [].
    const workers = Array.isArray(plain.workers_array) ? plain.workers_array : [];
    const base = {
        id_company: plain.id_company,
        company_name: plain.company_name,
        country: plain.country || "",
        main_description: plain.main_description || "",
        region: plain.region || plain.category || "",
        category: plain.category || "",
        productsArray: products.map((p) => (typeof p === "object" && p.id_product ? p.id_product : p)),
        userArray: workers,
    };
    if (options.includeProducts && products.length > 0) {
        base.products = products.map((p) => ({
            ...mapProductToApiFormat(p),
            company_name: plain.company_name || "",
        }));
    }
    return base;
}

export async function getAllCompanies() {
    try {
        if (!CompanyModel.sequelize) {
            console.warn("CompanyModel not initialized");
            return [];
        }

        let rows;
        try {
            rows = await CompanyModel.sequelize.query(
                `SELECT c.company_id AS id_company, c.commercial_name AS company_name, c.country, c.main_description, c.category AS region
                 FROM public.companies c
                 INNER JOIN public.company_portals cp ON c.company_id = cp.company_id AND cp.portal_id = :portalId
                 ORDER BY c.commercial_name ASC`,
                { replacements: { portalId: portal_id }, type: QueryTypes.SELECT }
            );
        } catch (joinErr) {
            if (joinErr.message?.includes("company_portals") || joinErr.message?.includes("does not exist")) {
                const companies = await CompanyModel.findAll({ order: [["company_name", "ASC"]] });
                return (companies || []).map((c) => mapCompanyToApiFormat(c, []));
            }
            throw joinErr;
        }

        if (!rows || rows.length === 0) {
            return [];
        }

        return rows.map((r) => mapCompanyToApiFormat(r, []));
    } catch (error) {
        console.error("Error fetching companies from database:", error);
        if (
            error.name === "SequelizeConnectionError" ||
            error.name === "SequelizeDatabaseError" ||
            (error.message?.includes("relation") && error.message?.includes("does not exist")) ||
            error.message?.includes("not initialized") ||
            error.message?.includes("Model not found")
        ) {
            return [];
        }
        throw error;
    }
}

/**
 * Returns { inCurrentPortal: true, company } when company is in current portal.
 * Returns { inCurrentPortal: false, portalId, company } when company exists in another portal.
 * Throws when company not found.
 */
export async function getCompanyById(idCompany) {
    try {
        if (!CompanyModel.sequelize) {
            throw new Error(`Company with id ${idCompany} not found`);
        }

        const company = await CompanyModel.findByPk(idCompany, {
            include: [{ model: ProductModel, as: "products", required: false }],
        });

        if (!company) {
            throw new Error(`Company with id ${idCompany} not found`);
        }

        let portalRow;
        try {
            [portalRow] = await CompanyModel.sequelize.query(
                `SELECT portal_id FROM public.company_portals WHERE company_id = :companyId`,
                { replacements: { companyId: idCompany }, type: QueryTypes.SELECT }
            );
        } catch {
            portalRow = { portal_id };
        }

        const products = company.products || [];
        const mapped = mapCompanyToApiFormat(company, products, { includeProducts: true });

        if (!portalRow) {
            return { inCurrentPortal: false, portalId: null, company: mapped };
        }
        if (portalRow.portal_id === portal_id) {
            return { inCurrentPortal: true, company: mapped };
        }
        return { inCurrentPortal: false, portalId: portalRow.portal_id, company: mapped };
    } catch (error) {
        console.error("Error fetching company from database:", error);
        throw error;
    }
}

/**
 * Create a new company.
 * @param {object} data - { id_company, company_name, country, main_description, region (stored as category), productsArray }
 * @returns {Promise<object>} Created company in API format
 */
export async function createCompany(data) {
    if (!CompanyModel.sequelize) {
        throw new Error("CompanyModel not initialized");
    }
    const id_company = data.id_company || `comp-${Date.now()}`;
    const existing = await CompanyModel.findByPk(id_company);
    if (existing) {
        throw new Error("Company with this id already exists");
    }
    const company = await CompanyModel.create({
        id_company,
        company_name: data.company_name || "",
        country: data.country || null,
        main_description: data.main_description || null,
        category: data.region ?? data.category ?? null,
    });
    return mapCompanyToApiFormat(company, []);
}
