import {DataTypes} from "sequelize";
import {TimeLogTypeEnum} from "../features/timeLog/TimeLogTypeEnum.js";
import TimeLogModel from "../features/timeLog/TimeLogModel.js";
import Database from "./database.js";
import {ModificationStatusEnum} from "../features/modification/ModificationStatusEnum.js";
import ModificationModel from "../features/modification/ModificationModel.js";
import ArticleModel from "../features/article/ArticleModel.js";
import ContentModel from "../features/content/ContentModel.js";
import EventModel from "../features/event/EventModel.js";
import PublicationModel from "../features/publication/PublicationModel.js";
import CompanyModel from "../features/company/CompanyModel.js";
import ProductModel from "../features/product/ProductModel.js";
import {defineAssociations} from "./associations.js";

const database = Database.getInstance();
const sequelize = database.getSequelize();

TimeLogModel.init({
    id: {type: DataTypes.BIGINT, primaryKey: true, unique: true, autoIncrement: true},
    createdBy: {type: DataTypes.STRING, allowNull: false},
    ip: {type: DataTypes.STRING},
    type: {type: DataTypes.ENUM(...Object.values(TimeLogTypeEnum)), allowNull: false},
    date: {type: DataTypes.DATE, allowNull: false},
    comment: {type: DataTypes.TEXT},
}, {
    sequelize,
    modelName: 'timeLog',
    underscored: true,
    indexes: [
        {fields: ['created_by']},
        {fields: ['type']},
        {fields: ['created_at']}
    ]
});

ModificationModel.init({
    id: {type: DataTypes.BIGINT, primaryKey: true, unique: true, autoIncrement: true},
    timeLogId: {type: DataTypes.BIGINT, allowNull: false},
    status: {type: DataTypes.ENUM(...Object.values(ModificationStatusEnum)), allowNull: false},
    oldType: {type: DataTypes.ENUM(...Object.values(TimeLogTypeEnum)), allowNull: false},
    newType: {type: DataTypes.ENUM(...Object.values(TimeLogTypeEnum)), allowNull: false},
    oldDate: {type: DataTypes.DATE},
    newDate: {type: DataTypes.DATE},
    comment: {type: DataTypes.TEXT},
    createdBy: {type: DataTypes.STRING, allowNull: false},
    reviewedBy: {type: DataTypes.STRING},
    reviewedAt: {type: DataTypes.DATE},
}, {
    sequelize,
    modelName: 'modification',
    underscored: true,
    indexes: [
        { fields: ['time_log_id'] },
        { fields: ['created_by'] },
        { fields: ['reviewed_by'] },
        { fields: ['status'] },
        { fields: ['reviewed_at'] },
    ]
});

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
    company: {
        type: DataTypes.STRING
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    article_tags_array: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    contents_array: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    highlited_position: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    is_article_event: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    event_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'article',
    underscored: true,
    indexes: [
        {fields: ['article_title']},
        {fields: ['date']},
        {fields: ['company']},
        {fields: ['is_article_event']},
        {fields: ['event_id']}
    ]
});

EventModel.init({
    id_fair: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true
    },
    event_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING
    },
    main_description: {
        type: DataTypes.TEXT
    },
    region: {
        type: DataTypes.STRING
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING
    },
    event_main_image: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'event',
    underscored: true,
    indexes: [
        { fields: ['event_name'] },
        { fields: ['start_date'] },
        { fields: ['region'] }
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
        field: "commercial_name"
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true
    },
    main_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'company',
    underscored: true,
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
        allowNull: true
    },
    main_image_src: {
        type: DataTypes.STRING(255),
        allowNull: true
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
        field: "company"
    }
}, {
    sequelize,
    modelName: 'product',
    underscored: true,
    indexes: [
        { fields: ['product_name'] },
        { fields: ['id_company'] }
    ]
});

ContentModel.init({
    content_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true
    },
    content_type: {
        type: DataTypes.ENUM('text_image', 'image_text', 'just_image', 'just_text'),
        allowNull: false
    },
    content_content: {
        type: DataTypes.JSONB,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'content',
    underscored: true,
    indexes: [
        {fields: ['content_type']}
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
    indexes: [
        {fields: ['date']},
        {fields: ['revista']}
    ]
});

defineAssociations();

export { TimeLogModel, ModificationModel, ArticleModel, ContentModel, EventModel, PublicationModel, CompanyModel, ProductModel };