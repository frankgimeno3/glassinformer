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
import {defineAssociations} from "./associations.js";

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
        {fields: ['date']},
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
        { fields: ['start_date'] },
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
    category: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "company_category"
    }
}, {
    sequelize,
    modelName: 'company',
    underscored: true,
    tableName: "companies_db",
    timestamps: false,
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
    panel_ticket_category: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    panel_ticket_state: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "pending" },
    panel_ticket_date: { type: DataTypes.DATE, allowNull: true },
    panel_ticket_brief_description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    panel_ticket_full_description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
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
        { fields: ["panel_ticket_date"] },
        { fields: ["panel_ticket_category"] }
    ]
});

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

defineAssociations();

export { ArticleModel, ContentModel, EventModel, PublicationModel, CompanyModel, ProductModel, BannerModel, UserProfileModel, CommentModel, PanelTicketModel };