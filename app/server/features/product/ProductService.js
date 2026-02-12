import ProductModel from "./ProductModel.js";
import CompanyModel from "../company/CompanyModel.js";
// Ensure models are initialized (same pattern as ArticleService)
import "../../database/models.js";

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

        // Same pattern as getAllArticles: simple findAll with order (no include)
        const products = await ProductModel.findAll({
            order: [["product_name", "ASC"]],
        });

        if (!products || products.length === 0) {
            return [];
        }

        // Get company names in one query (avoid include which can fail in some setups)
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

        return mapProductToApiFormat(product);
    } catch (error) {
        console.error("Error fetching product from database:", error);
        throw error;
    }
}
