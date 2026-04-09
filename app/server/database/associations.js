import CompanyModel from "../features/company/CompanyModel.js";
import ProductModel from "../features/product/ProductModel.js";

let associationsAlreadyDefined = false;

export function defineAssociations() {
    if (associationsAlreadyDefined) return;
    associationsAlreadyDefined = true;

    CompanyModel.hasMany(ProductModel, {
        foreignKey: 'id_company',
        as: 'products',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })

    ProductModel.belongsTo(CompanyModel, {
        foreignKey: 'id_company',
        as: 'company'
    })
}
