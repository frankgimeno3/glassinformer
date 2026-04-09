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
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    event_main_image: {
        type: DataTypes.STRING,
        field: "event_main_image_src"
    }
}, {
    sequelize,
    modelName: 'event',
    underscored: true,
    tableName: 'events',
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
    id_publication: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true
    },
    redirection_link: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    revista: {
        type: DataTypes.STRING,
        allowNull: false
    },
    número: {
        type: DataTypes.STRING,
        allowNull: false
    },
    publication_main_image_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'publication',
    underscored: true,
    tableName: "publications_db",
    indexes: [
        {fields: ['date']},
        {fields: ['revista']}
    ]
});

UserProfileModel.init({
    id_user: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        unique: true,
        field: "id_user"
    },
    user_name: {
        type: DataTypes.STRING(255),
        defaultValue: "",
        allowNull: true
    },
    user_surnames: {
        type: DataTypes.STRING(255),
        defaultValue: "",
        allowNull: true
    },
    user_description: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: true
    },
    user_main_image_src: {
        type: DataTypes.STRING(2048),
        defaultValue: "",
        allowNull: true
    },
    user_current_company: {
        type: DataTypes.JSONB,
        defaultValue: { id_company: "", userPosition: "" },
        allowNull: true
    },
    experience_array: {
        type: DataTypes.JSONB,
        defaultValue: [],
        allowNull: true
    }
}, {
    sequelize,
    modelName: "userProfile",
    tableName: "users",
    underscored: true,
    timestamps: false,
    indexes: [
        { fields: ["id_user"] }
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

export { ArticleModel, ContentModel, EventModel, PublicationModel, CompanyModel, ProductModel, BannerModel, UserProfileModel, CommentModel };