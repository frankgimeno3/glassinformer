import ProductModel from "./ProductModel.js";
import CompanyModel from "../company/CompanyModel.js";
import "../../database/models.js";
import { QueryTypes } from "sequelize";
import { portal_id } from "../../../GlassInformerSpecificData.js";

export function mapProductToApiFormat(product, companyNameOrUndefined) {
    const plain = product.get ? product.get({ plain: true }) : product;
    const company = plain.company;
    const companyName =
        companyNameOrUndefined !== undefined
            ? companyNameOrUndefined
            : (company ? company.company_name : "");
    const categories = plain.product_categories_array;
    const tagsArray = Array.isArray(categories) ? categories : [];
    return {
        id_product: plain.id_product,
        product_name: plain.product_name,
        product_description: plain.product_description || "",
        tagsArray,
        price: plain.price != null ? Number(plain.price) : null,
        main_image_src: plain.main_image_src || "",
        id_company: plain.id_company,
        company_name: companyName || "",
    };
}

export async function getAllProducts() {
    try {
        if (!ProductModel.sequelize) {
            console.warn("ProductModel not initialized");
            return [];
        }

        let rows;
        try {
            rows = await ProductModel.sequelize.query(
                `SELECT p.product_id AS id_product, p.product_name, p.product_description, p.price,
                        p.main_image_src, p.company AS id_company, p.product_categories_array,
                        c.commercial_name AS company_name
                 FROM public.products p
                 INNER JOIN public.product_portals pp ON p.product_id = pp.product_id AND pp.portal_id = :portalId
                 LEFT JOIN public.companies c ON p.company = c.company_id
                 ORDER BY p.product_name ASC`,
                { replacements: { portalId: portal_id }, type: QueryTypes.SELECT }
            );
        } catch (joinErr) {
            if (joinErr.message?.includes("product_portals") || joinErr.message?.includes("does not exist")) {
                const products = await ProductModel.findAll({ order: [["product_name", "ASC"]] });
                if (!products || products.length === 0) return [];
                const companyIds = [...new Set(products.map((p) => p.id_company).filter(Boolean))];
                const companyNameById = new Map();
                if (companyIds.length > 0) {
                    const companies = await CompanyModel.findAll({
                        where: { id_company: companyIds },
                        attributes: ["id_company", "company_name"],
                    });
                    companies.forEach((c) => {
                        const plain = c.get ? c.get({ plain: true }) : c;
                        companyNameById.set(plain.id_company, plain.company_name || "");
                    });
                }
                return products.map((p) => {
                    const plain = p.get ? p.get({ plain: true }) : p;
                    return mapProductToApiFormat(p, companyNameById.get(plain.id_company) || "");
                });
            }
            throw joinErr;
        }

        if (!rows || rows.length === 0) {
            return [];
        }

        return rows.map((r) => {
            const tagsArray = Array.isArray(r.product_categories_array) ? r.product_categories_array : [];
            return {
                id_product: r.id_product,
                product_name: r.product_name,
                product_description: r.product_description || "",
                tagsArray,
                price: r.price != null ? Number(r.price) : null,
                main_image_src: r.main_image_src || "",
                id_company: r.id_company,
                company_name: r.company_name || "",
            };
        });
    } catch (error) {
        console.error("Error fetching products from database:", error);
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
 * Returns { inCurrentPortal: true, product } when product is in current portal.
 * Returns { inCurrentPortal: false, portalId, product } when product exists in another portal.
 * Throws when product not found.
 */
export async function getProductById(idProduct) {
    try {
        if (!ProductModel.sequelize) {
            throw new Error(`Product with id ${idProduct} not found`);
        }

        const product = await ProductModel.findByPk(idProduct, {
            include: [{ model: CompanyModel, as: "company", required: false }],
        });

        if (!product) {
            throw new Error(`Product with id ${idProduct} not found`);
        }

        let portalRow;
        try {
            [portalRow] = await ProductModel.sequelize.query(
                `SELECT portal_id FROM public.product_portals WHERE product_id = :productId`,
                { replacements: { productId: idProduct }, type: QueryTypes.SELECT }
            );
        } catch {
            portalRow = { portal_id };
        }

        const mapped = mapProductToApiFormat(product);

        if (!portalRow) {
            return { inCurrentPortal: false, portalId: null, product: mapped };
        }
        if (portalRow.portal_id === portal_id) {
            return { inCurrentPortal: true, product: mapped };
        }
        return { inCurrentPortal: false, portalId: portalRow.portal_id, product: mapped };
    } catch (error) {
        console.error("Error fetching product from database:", error);
        throw error;
    }
}

/**
 * Create a new product.
 * @param {object} data - { id_product?, product_name, product_description, id_company, tagsArray?, price?, main_image_src? }
 * @returns {Promise<object>} Created product in API format
 */
export async function createProduct(data) {
    if (!ProductModel.sequelize) {
        throw new Error("ProductModel not initialized");
    }
    const id_product = data.id_product || `prod-${Date.now()}`;
    const existing = await ProductModel.findByPk(id_product);
    if (existing) {
        throw new Error("Product with this id already exists");
    }
    const tagsArray = Array.isArray(data.tagsArray) ? data.tagsArray : [];
    const product = await ProductModel.create({
        id_product,
        product_name: data.product_name || "",
        product_description: data.product_description || null,
        id_company: data.id_company,
        price: data.price != null && data.price !== "" ? data.price : null,
        main_image_src: data.main_image_src || null,
        product_categories_array: tagsArray,
    });
    return mapProductToApiFormat(product);
}
