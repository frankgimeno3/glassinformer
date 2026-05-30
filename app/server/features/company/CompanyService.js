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
        category: plain.region || plain.category || "",
        company_main_image: plain.main_image || "",
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

export async function isCompanyAdministrator(companyId, userId) {
    if (!CompanyModel.sequelize) return false;
    const cid = String(companyId || "").trim();
    const uid = String(userId || "").trim();
    if (!cid || !uid) return false;
    const rows = await CompanyModel.sequelize.query(
        `SELECT 1
         FROM public.company_administrators
         WHERE company_id = :cid AND user_id = :uid::uuid
         LIMIT 1`,
        { replacements: { cid, uid }, type: QueryTypes.SELECT }
    );
    return Array.isArray(rows) && rows.length > 0;
}

export async function getActiveCompanyTeam(companyId) {
    if (!CompanyModel.sequelize) return [];
    const cid = String(companyId || "").trim();
    if (!cid) return [];
    const rows = await CompanyModel.sequelize.query(
        `SELECT
            er.employee_rel_id::text AS employee_rel_id,
            er.employee_user_id::text AS user_id,
            er.employee_role AS employee_role,
            er.employee_rel_status AS employee_rel_status,
            ud.user_name AS user_name,
            ud.user_surnames AS user_surnames,
            ud.user_main_image_src AS user_main_image_src
         FROM public.employee_relations er
         LEFT JOIN public.users_db ud ON ud.user_id = er.employee_user_id
         WHERE er.employee_company_id = :cid
           AND er.employee_rel_status = 'active'
         ORDER BY COALESCE(ud.user_name, '') ASC`,
        { replacements: { cid }, type: QueryTypes.SELECT }
    );
    return Array.isArray(rows) ? rows.map((r) => ({
        employee_rel_id: String(r.employee_rel_id || ""),
        user_id: String(r.user_id || ""),
        employee_role: String(r.employee_role || "employee"),
        user_name: r.user_name != null ? String(r.user_name) : "",
        user_surnames: r.user_surnames != null ? String(r.user_surnames) : "",
        user_main_image_src: r.user_main_image_src != null ? String(r.user_main_image_src) : "",
    })) : [];
}

export async function hasEmployeeRelation(companyId, userId) {
    if (!CompanyModel.sequelize) return false;
    const cid = String(companyId || "").trim();
    const uid = String(userId || "").trim();
    if (!cid || !uid) return false;
    const rows = await CompanyModel.sequelize.query(
        `SELECT 1
         FROM public.employee_relations
         WHERE employee_company_id = :cid
           AND employee_user_id = :uid::uuid
         LIMIT 1`,
        { replacements: { cid, uid }, type: QueryTypes.SELECT }
    );
    return Array.isArray(rows) && rows.length > 0;
}

export async function hasActiveEmployeeRelation(companyId, userId) {
    if (!CompanyModel.sequelize) return false;
    const cid = String(companyId || "").trim();
    const uid = String(userId || "").trim();
    if (!cid || !uid) return false;
    const rows = await CompanyModel.sequelize.query(
        `SELECT 1
         FROM public.employee_relations
         WHERE employee_company_id = :cid
           AND employee_user_id = :uid::uuid
           AND employee_rel_status = 'active'
         LIMIT 1`,
        { replacements: { cid, uid }, type: QueryTypes.SELECT }
    );
    return Array.isArray(rows) && rows.length > 0;
}

export async function updateCompanyByAdministrator(companyId, userId, updates = {}) {
    if (!CompanyModel.sequelize) throw new Error("Database not configured");
    const cid = String(companyId || "").trim();
    const uid = String(userId || "").trim();
    if (!cid || !uid) throw new Error("Invalid company/user");
    const ok = await isCompanyAdministrator(cid, uid);
    if (!ok) throw new Error("Forbidden");

    const patch = {};
    if (updates.company_name !== undefined) patch.company_name = String(updates.company_name ?? "");
    if (updates.country !== undefined) patch.country = String(updates.country ?? "");
    if (updates.main_description !== undefined) patch.main_description = String(updates.main_description ?? "");
    if (updates.region !== undefined) patch.region = String(updates.region ?? "");
    else if (updates.category !== undefined) patch.region = String(updates.category ?? "");
    if (updates.company_main_image !== undefined) patch.main_image = String(updates.company_main_image ?? "");

    if (Object.keys(patch).length === 0) return await getCompanyById(cid);
    await CompanyModel.update(patch, { where: { id_company: cid } });
    return await getCompanyById(cid);
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
                `SELECT c.company_id AS id_company, c.company_commercial_name AS company_name, c.company_country AS country, c.company_main_description AS main_description, c.company_region AS region
                 FROM public.companies_db c
                 INNER JOIN public.company_portals cp ON c.company_id = cp.company_id AND cp.portal_id = :portalId
                 ORDER BY c.company_commercial_name ASC`,
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
async function ensureCompanyPortalRow(sequelize, companyId, commercialName) {
    const baseSlug =
        (commercialName || companyId)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "") || String(companyId).replace(/_/g, "-");
    let finalSlug = baseSlug || "company";
    let suffix = 0;
    for (;;) {
        const collision = await sequelize.query(
            `SELECT 1 AS one FROM public.company_portals WHERE portal_id = :portalId AND company_portal_slug = :slug LIMIT 1`,
            { replacements: { portalId: portal_id, slug: finalSlug }, type: QueryTypes.SELECT }
        );
        if (!collision || collision.length === 0) break;
        finalSlug = `${baseSlug}-${++suffix}`;
    }
    await sequelize.query(
        `INSERT INTO public.company_portals (company_id, portal_id, company_portal_slug)
         SELECT :companyId, :portalId, :slug
         WHERE NOT EXISTS (
           SELECT 1 FROM public.company_portals
           WHERE company_id = :companyId AND portal_id = :portalId
         )`,
        { replacements: { companyId, portalId: portal_id, slug: finalSlug } }
    );
}

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
        region: data.region ?? data.category ?? "",
    });
    try {
        await ensureCompanyPortalRow(CompanyModel.sequelize, id_company, data.company_name || "");
    } catch (portalErr) {
        console.warn("createCompany: company_portals insert skipped or failed:", portalErr?.message || portalErr);
    }
    return mapCompanyToApiFormat(company, []);
}
