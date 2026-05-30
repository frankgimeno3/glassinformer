import {DataTypes} from "sequelize";
import Database from "./database.js";
import ArticleModel from "../features/article/ArticleModel.js";
import CommentModel from "../features/comment/CommentModel.js";
import ContentModel from "../features/content/ContentModel.js";
import EventModel from "../features/event/EventModel.js";
import PublicationModel from "../features/publication/PublicationModel.js";
import CompanyModel from "../features/company/CompanyModel.js";
import ProductModel from "../features/product/ProductModel.js";
import BannerModel from "../features/banner/BannerModel.js";
import UserProfileModel from "../features/userProfile/UserProfileModel.js";
import PanelTicketModel from "../features/panel_ticket/PanelTicketModel.js";
import PanelTicketAdvertisementModel from "../features/panel_ticket/PanelTicketAdvertisementModel.js";
import PanelTicketCompanyDataModel from "../features/panel_ticket/PanelTicketCompanyDataModel.js";
import PanelTicketProductDataModel from "../features/panel_ticket/PanelTicketProductDataModel.js";
import {defineAssociations} from "./associations.js";
import ServiceGroupDbModel from "../features/service_catalog/ServiceGroupDbModel.js";
import ServiceDbModel from "../features/service_catalog/ServiceDbModel.js";
import PublicationSlotDbModel from "../features/publication_workflow/PublicationSlotDbModel.js";
import PublicationArticleDbModel from "../features/publication_workflow/PublicationArticleDbModel.js";
import PublicationArticleChunkDbModel from "../features/publication_workflow/PublicationArticleChunkDbModel.js";

const database = Database.getInstance();
const sequelize = database.getSequelize();

ArticleModel.init({
    id_article: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true
    },
    article_title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    article_subtitle: {
        type: DataTypes.STRING
    },
    article_main_image_url: {
        type: DataTypes.STRING
    },
    article_company_names_array: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: []
    },
    article_company_id_array: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: []
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "article_date"
    },
    highlited_position: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
        field: "article_highlited_position"
    },
    is_article_event: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    event_id: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
        field: "article_event_id"
    }
}, {
    sequelize,
    modelName: 'article',
    tableName: 'articles_db',
    underscored: true,
    timestamps: true,
    createdAt: 'article_created_at',
    updatedAt: 'article_updated_at',
    indexes: [
        {fields: ['article_title']},
        {fields: ['article_date']},
        {fields: ['is_article_event']},
        {fields: ['event_id']}
    ]
});

EventModel.init({
    id_fair: { type: DataTypes.STRING, primaryKey: true, unique: true, field: "event_id" },
    event_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: { type: DataTypes.STRING, field: "event_country" },
    location: { type: DataTypes.STRING, field: "event_location" },
    main_description: { type: DataTypes.TEXT, field: "event_main_description" },
    region: { type: DataTypes.STRING, field: "event_region" },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "event_start_date"
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "event_end_date"
    },
    event_main_image: {
        type: DataTypes.STRING,
        field: "event_main_image_src"
    }
}, {
    sequelize,
    modelName: 'event',
    underscored: true,
    tableName: 'events_db',
    timestamps: true,
    createdAt: 'event_created_at',
    updatedAt: 'event_updated_at',
    indexes: [
        { fields: ['event_name'] },
        { fields: ['event_start_date'] },
        { fields: ['event_region'] }
    ]
});

CompanyModel.init({
    id_company: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        field: "company_id"
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "company_commercial_name"
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "company_country"
    },
    main_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "company_main_description"
    },
    region: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "company_region"
    },
    main_image: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
        field: "company_main_image"
    },
    employee_relations_array: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
        field: "company_employee_relations_array"
    }
}, {
    sequelize,
    modelName: 'company',
    underscored: true,
    tableName: "companies_db",
    timestamps: true,
    createdAt: "company_created_at",
    updatedAt: "company_updated_at",
    indexes: [
        { fields: ['country'] }
    ]
});

ProductModel.init({
    id_product: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        field: "product_id"
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    product_description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "product_price"
    },
    main_image_src: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "product_main_image_src"
    },
    product_categories_array: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
        field: "product_categories_array"
    },
    id_company: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "company_id"
    }
}, {
    sequelize,
    modelName: 'product',
    underscored: true,
    tableName: "products_db",
    timestamps: true,
    createdAt: "product_created_at",
    updatedAt: "product_updated_at",
    indexes: [
        { fields: ['product_name'] },
        { fields: ['id_company'] }
    ]
});

ContentModel.init({
    content_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        field: "article_content_id"
    },
    article_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: { model: 'article', key: 'id_article' }
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "article_content_position"
    },
    content_type: {
        type: DataTypes.ENUM('text_image', 'image_text', 'just_image', 'just_text'),
        allowNull: false,
        field: "article_content_type"
    },
    content_content: {
        type: DataTypes.JSONB,
        allowNull: false,
        field: "article_content_content"
    }
}, {
    sequelize,
    modelName: 'content',
    tableName: "article_contents",
    underscored: true,
    timestamps: true,
    createdAt: "article_created_at",
    updatedAt: "article_updated_at",
    indexes: [
        { fields: ['content_type'] },
        { fields: ['article_id', 'position'] }
    ]
});

PublicationModel.init({
    // Canonical RDS schema: public.publications_db (see plynium_central_panel/docs/RDS_SCHEMA.md)
    publication_id: { type: DataTypes.STRING, primaryKey: true, unique: true, field: "publication_id" },
    publication_main_image_url: { type: DataTypes.STRING, allowNull: true, field: "publication_main_image_url" },
    magazine_id: { type: DataTypes.STRING, allowNull: true, field: "magazine_id" },
    publication_year: { type: DataTypes.INTEGER, allowNull: true, field: "publication_year" },
    publication_edition_name: { type: DataTypes.STRING, allowNull: true, field: "publication_edition_name" },
    magazine_general_issue_number: { type: DataTypes.INTEGER, allowNull: true, field: "magazine_general_issue_number" },
    magazine_this_year_issue: { type: DataTypes.INTEGER, allowNull: true, field: "magazine_this_year_issue" },
    publication_expected_publication_month: { type: DataTypes.SMALLINT, allowNull: true, field: "publication_expected_publication_month" },
    real_publication_month_date: { type: DataTypes.DATEONLY, allowNull: true, field: "real_publication_month_date" },
    publication_materials_deadline: { type: DataTypes.DATEONLY, allowNull: true, field: "publication_materials_deadline" },
    is_special_edition: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "is_special_edition" },
    publication_theme: { type: DataTypes.STRING, allowNull: true, field: "publication_theme" },
    publication_status: { type: DataTypes.STRING, allowNull: false, field: "publication_status" },
    publication_format: { type: DataTypes.STRING, allowNull: false, field: "publication_format" },
}, {
    sequelize,
    modelName: 'publication',
    underscored: true,
    tableName: "publications_db",
    timestamps: false,
    indexes: [
        { fields: ['publication_year'] },
        { fields: ['magazine_id'] },
        { fields: ['real_publication_month_date'] }
    ]
});

UserProfileModel.init({
    // Canonical RDS schema: public.users_db (see plynium_central_panel/docs/RDS_SCHEMA.md)
    user_id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, field: "user_id" },
    user_email: { type: DataTypes.STRING(255), allowNull: false, field: "user_email" },
    user_name: { type: DataTypes.STRING(255), allowNull: true, field: "user_name" },
    user_surnames: { type: DataTypes.STRING(255), allowNull: true, field: "user_surnames" },
    user_description: { type: DataTypes.TEXT, allowNull: true, field: "user_description" },
    user_main_image_src: { type: DataTypes.STRING(2048), allowNull: true, field: "user_main_image_src" },
    user_cognito_sub: { type: DataTypes.STRING(255), allowNull: true, field: "user_cognito_sub" },
    user_linkedin_profile: { type: DataTypes.STRING(1024), allowNull: true, field: "user_linkedin_profile" },
}, {
    sequelize,
    modelName: "userProfile",
    tableName: "users_db",
    underscored: true,
    timestamps: false,
    indexes: [
        { fields: ["user_email"] }
    ]
});

PanelTicketModel.init({
    // Canonical RDS schema: public.panel_tickets (see plynium_central_panel/docs/RDS_SCHEMA.md)
    panel_ticket_id: { type: DataTypes.STRING(255), primaryKey: true, allowNull: false },
    panel_ticket_type: { type: DataTypes.STRING(255), allowNull: false },
    panel_ticket_state: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "pending" },
    panel_ticket_date: { type: DataTypes.DATE, allowNull: true },
    panel_ticket_brief_description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    panel_ticket_full_description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    panel_ticket_contact_name: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    panel_ticket_contact_email: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    panel_ticket_contact_phone: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    panel_ticket_interest: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    panel_ticket_related_to_user_id_array: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false, defaultValue: [] },
    panel_ticket_updates_array: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] }
}, {
    sequelize,
    modelName: "panel_ticket",
    underscored: true,
    tableName: "panel_tickets",
    timestamps: true,
    createdAt: "panel_ticket_created_at",
    updatedAt: "updated_at",
    indexes: [
        { fields: ["panel_ticket_type"] },
        { fields: ["panel_ticket_state"] },
        { fields: ["panel_ticket_date"] }
    ]
});

PanelTicketAdvertisementModel.init({
    panel_ticket_advertisement_id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    ticket_id: { type: DataTypes.STRING(255), allowNull: false, unique: true, references: { model: "panel_tickets", key: "panel_ticket_id" } },
    contact_full_name: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    contact_email: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    company_country: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "" },
    phone_country_prefix: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "" },
    phone_number: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    interest: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    message: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    terms_accepted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    services_array: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false, defaultValue: [] }
}, {
    sequelize,
    modelName: "panel_ticket_advertisement",
    underscored: true,
    tableName: "panel_ticket_advertisement",
    timestamps: false,
    indexes: [{ fields: ["ticket_id"] }]
});

PanelTicketCompanyDataModel.init(
    {
        ticket_company_data_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        ticket_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            references: { model: "panel_tickets", key: "panel_ticket_id" },
        },
        ticket_company_name: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "" },
        ticket_company_tax_name: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "" },
        ticket_company_tax_id: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "" },
        ticket_company_creator_role: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "" },
        ticket_company_website: { type: DataTypes.STRING(255), allowNull: true, defaultValue: "" },
        ticket_company_country: { type: DataTypes.STRING(255), allowNull: true, defaultValue: "" },
        ticket_company_description: { type: DataTypes.TEXT, allowNull: true, defaultValue: "" },
        ticket_company_list_as_employee: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
        sequelize,
        modelName: "panel_ticket_company_data",
        underscored: true,
        tableName: "panel_ticket_company_data",
        timestamps: false,
        indexes: [{ fields: ["ticket_id"] }],
    }
);

PanelTicketProductDataModel.init(
    {
        ticket_product_data_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        ticket_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            references: { model: "panel_tickets", key: "panel_ticket_id" },
        },
        ticket_product_name: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "" },
        ticket_product_description: { type: DataTypes.TEXT, allowNull: true, defaultValue: "" },
        ticket_product_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        ticket_product_company_id: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "" },
        ticket_product_main_image_src: { type: DataTypes.STRING(2048), allowNull: true, defaultValue: "" },
        ticket_product_categories_array: { type: DataTypes.ARRAY(DataTypes.STRING(255)), allowNull: true, defaultValue: [] },
        updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
        sequelize,
        modelName: "panel_ticket_product_data",
        underscored: true,
        tableName: "panel_ticket_product_data",
        timestamps: false,
        indexes: [{ fields: ["ticket_id"] }, { fields: ["ticket_product_company_id"] }],
    }
);

BannerModel.init({
    id_banner: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        unique: true,
        field: "id_banner"
    },
    banner_image_src: {
        type: DataTypes.STRING(2048),
        allowNull: false,
        field: "banner_image_src"
    },
    banner_route: {
        type: DataTypes.STRING(512),
        allowNull: false,
        defaultValue: "/",
        field: "banner_route"
    },
    banner_redirection_url: {
        type: DataTypes.STRING(2048),
        allowNull: false,
        defaultValue: "",
        field: "banner_redirection_url"
    },
    banner_position_type: {
        type: DataTypes.STRING(32),
        allowNull: false,
        field: "banner_position_type"
    },
    banner_page_type: {
        type: DataTypes.STRING(32),
        allowNull: false,
        field: "banner_page_type"
    },
    portal_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "portal_id"
    },
    banner_starting_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "banner_starting_date"
    },
    banner_ending_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "banner_ending_date"
    },
    banner_appearence_weight: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
        field: "banner_appearence_weight"
    },
    banner_position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "banner_position"
    },
    banner_status: {
        type: DataTypes.STRING(32),
        allowNull: true,
        field: "banner_status"
    },
    alt: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "alt"
    },
    starts_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "starts_at"
    },
    ends_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "ends_at"
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "position"
    }
}, {
    sequelize,
    modelName: 'banner',
    tableName: 'portal_banners',
    underscored: true,
    timestamps: true,
    createdAt: 'banner_created_at',
    updatedAt: 'banner_updated_at',
    indexes: [
        { fields: ['banner_position_type'] },
        { fields: ['banner_page_type'] },
        { fields: ['portal_id'] }
    ]
});

ServiceGroupDbModel.init({
    service_group_id: { type: DataTypes.UUID, primaryKey: true },
    service_group_name: { type: DataTypes.STRING(255), allowNull: false },
    service_group_channel: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "" }
}, {
    sequelize,
    modelName: "service_group",
    underscored: true,
    tableName: "service_groups",
    timestamps: false
});

ServiceDbModel.init({
    service_id: { type: DataTypes.STRING(64), primaryKey: true, unique: true },
    service_full_name: { type: DataTypes.STRING(512), allowNull: false, defaultValue: "" },
    service_group_id: { type: DataTypes.UUID, allowNull: false },
    service_portal: { type: DataTypes.INTEGER, allowNull: false },
    service_format: { type: DataTypes.STRING(512), allowNull: false, defaultValue: "" },
    service_description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    service_unit: { type: DataTypes.STRING(128), allowNull: false, defaultValue: "" },
    service_unit_price: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
    service_unit_specifications: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" }
}, {
    sequelize,
    modelName: "service_db",
    underscored: true,
    tableName: "services_db",
    timestamps: false,
    indexes: [
        { fields: ["service_full_name"] },
        { fields: ["service_group_id"] },
        { fields: ["service_portal"] }
    ]
});

CommentModel.init({
    article_comment_id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        unique: true,
        field: "article_comment_id"
    },
    article_comment_timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "article_comment_timestamp"
    },
    article_comment_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "article_comment_user_id"
    },
    article_comment_content: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "article_comment_content"
    },
    article_portals_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "article_portals_id"
    }
}, {
    sequelize,
    modelName: 'comment',
    tableName: 'article_comments',
    underscored: true,
    timestamps: false,
    indexes: [
        { fields: ['article_portals_id'] },
        { fields: ['article_comment_timestamp'] }
    ]
});

PublicationSlotDbModel.init({
    publication_slot_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    publication_id: { type: DataTypes.STRING(255), allowNull: true },
    publication_format: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "flipbook" },
    slot_key: { type: DataTypes.STRING(32), allowNull: false },
    slot_content_type: { type: DataTypes.STRING(32), allowNull: false },
    slot_state: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "pending" },
    customer_id: { type: DataTypes.STRING(64), allowNull: true },
    project_id: { type: DataTypes.STRING(64), allowNull: true },
    slot_media_url: { type: DataTypes.STRING(512), allowNull: true },
    slot_flatplan_image_url: { type: DataTypes.STRING(512), allowNull: true },
    slot_article_id: { type: DataTypes.STRING(64), allowNull: true },
    magazine_page_layout: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "2_col_article",
    },
    publication_page: { type: DataTypes.FLOAT, allowNull: false },
    slot_ordinal: { type: DataTypes.FLOAT, allowNull: false },
}, {
    sequelize,
    modelName: "publication_slot",
    underscored: true,
    tableName: "publication_slots_db",
    timestamps: true,
    createdAt: "slot_created_at",
    updatedAt: "slot_updated_at",
    indexes: [
        { fields: ["publication_id"] },
        { fields: ["publication_id", "slot_ordinal"] },
    ],
});

PublicationArticleDbModel.init({
    publication_article_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    publication_id: { type: DataTypes.STRING(255), allowNull: false },
    article_id: { type: DataTypes.TEXT, allowNull: false },
    publication_slots_id_array: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: false,
        defaultValue: [],
    },
    desired_page_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    publication_article_state: {
        type: DataTypes.STRING(64),
        allowNull: false,
        defaultValue: "unfinished",
    },
    publication_art_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    sequelize,
    modelName: "publication_article",
    underscored: true,
    tableName: "publication_articles",
    timestamps: true,
    createdAt: "publication_article_created_at",
    updatedAt: "publication_article_updated_at",
    indexes: [
        { fields: ["publication_id"] },
        { fields: ["article_id"] },
    ],
});

PublicationArticleChunkDbModel.init({
    publication_article_chunk_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    publication_article_id: { type: DataTypes.UUID, allowNull: false },
    publication_id: { type: DataTypes.STRING(255), allowNull: false },
    publication_slot_id: { type: DataTypes.INTEGER, allowNull: true },
    publication_article_chunk_format: {
        type: DataTypes.STRING(64),
        allowNull: false,
        defaultValue: "only_text",
    },
    chunk_html: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    chunk_position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
    sequelize,
    modelName: "publication_article_chunk",
    underscored: true,
    tableName: "publication_article_chunks",
    timestamps: false,
    indexes: [
        { fields: ["publication_id"] },
        { fields: ["publication_slot_id"] },
    ],
});

defineAssociations();

export {
    ArticleModel,
    ContentModel,
    EventModel,
    PublicationModel,
    PublicationSlotDbModel,
    PublicationArticleDbModel,
    PublicationArticleChunkDbModel,
    CompanyModel,
    ProductModel,
    BannerModel,
    UserProfileModel,
    CommentModel,
    PanelTicketModel,
    PanelTicketAdvertisementModel,
    PanelTicketCompanyDataModel,
    PanelTicketProductDataModel,
    ServiceGroupDbModel,
    ServiceDbModel
};