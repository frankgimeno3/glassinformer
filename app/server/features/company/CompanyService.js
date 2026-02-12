import CompanyModel from "./CompanyModel.js";
import ProductModel from "../product/ProductModel.js";
import { mapProductToApiFormat } from "../product/ProductService.js";
// Ensure models are initialized (same pattern as ArticleService)
import "../../database/models.js";

function mapCompanyToApiFormat(company, products = [], options = { includeProducts: false }) {
    const plain = company.get ? company.get({ plain: true }) : company;
    const base = {
        id_company: plain.id_company,
        company_name: plain.company_name,
        country: plain.country || "",
        main_description: plain.main_description || "",
        region: plain.region || plain.category || "",
        category: plain.category || "",
        productsArray: products.map((p) => (typeof p === "object" && p.id_product ? p.id_product : p)),
        userArray: [],
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

        // Same pattern as getAllArticles: simple findAll with order (no include)
        const companies = await CompanyModel.findAll({
            order: [["company_name", "ASC"]],
        });

        if (!companies || companies.length === 0) {
            return [];
        }

        return companies.map((c) => mapCompanyToApiFormat(c, []));
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

        const products = company.products || [];
        return mapCompanyToApiFormat(company, products, { includeProducts: true });
    } catch (error) {
        console.error("Error fetching company from database:", error);
        throw error;
    }
}
