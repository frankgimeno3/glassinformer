import TimeLogModel from "../features/timeLog/TimeLogModel.js";
import ModificationModel from "../features/modification/ModificationModel.js";
import CompanyModel from "../features/company/CompanyModel.js";
import ProductModel from "../features/product/ProductModel.js";

let associationsAlreadyDefined = false;

export function defineAssociations() {
    if (associationsAlreadyDefined) return;
    associationsAlreadyDefined = true;

    TimeLogModel.hasMany(ModificationModel, {
        foreignKey: 'time_log_id',
        as: 'modifications',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })

    ModificationModel.belongsTo(TimeLogModel, {
        foreignKey: 'time_log_id',
        as: 'timeLog'
    })

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