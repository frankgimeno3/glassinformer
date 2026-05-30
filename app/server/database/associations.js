import CompanyModel from "../features/company/CompanyModel.js";
import ProductModel from "../features/product/ProductModel.js";
import ServiceGroupDbModel from "../features/service_catalog/ServiceGroupDbModel.js";
import ServiceDbModel from "../features/service_catalog/ServiceDbModel.js";
import PanelTicketModel from "../features/panel_ticket/PanelTicketModel.js";
import PanelTicketAdvertisementModel from "../features/panel_ticket/PanelTicketAdvertisementModel.js";
import PanelTicketCompanyDataModel from "../features/panel_ticket/PanelTicketCompanyDataModel.js";

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
    });

    ServiceDbModel.belongsTo(ServiceGroupDbModel, { foreignKey: "service_group_id", as: "service_group" });
    ServiceGroupDbModel.hasMany(ServiceDbModel, { foreignKey: "service_group_id", as: "services" });

    PanelTicketModel.hasOne(PanelTicketAdvertisementModel, {
        foreignKey: "ticket_id",
        sourceKey: "panel_ticket_id",
        as: "advertisement_request",
        onDelete: "CASCADE"
    });
    PanelTicketAdvertisementModel.belongsTo(PanelTicketModel, {
        foreignKey: "ticket_id",
        targetKey: "panel_ticket_id"
    });

    PanelTicketModel.hasOne(PanelTicketCompanyDataModel, {
        foreignKey: "ticket_id",
        sourceKey: "panel_ticket_id",
        as: "company_data",
        onDelete: "CASCADE",
    });
    PanelTicketCompanyDataModel.belongsTo(PanelTicketModel, {
        foreignKey: "ticket_id",
        targetKey: "panel_ticket_id",
    });
}
