import {DataTypes} from "sequelize";
import {TimeLogTypeEnum} from "../features/timeLog/TimeLogTypeEnum.js";
import TimeLogModel from "../features/timeLog/TimeLogModel.js";
import Database from "./database.js";
import {ModificationStatusEnum} from "../features/modification/ModificationStatusEnum.js";
import ModificationModel from "../features/modification/ModificationModel.js";
import ArticleModel from "../features/article/ArticleModel.js";
import ContentModel from "../features/content/ContentModel.js";
import PublicationModel from "../features/publication/PublicationModel.js";
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
    }
}, {
    sequelize,
    modelName: 'article',
    underscored: true,
    indexes: [
        {fields: ['article_title']},
        {fields: ['date']},
        {fields: ['company']}
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

export { TimeLogModel, ModificationModel, ArticleModel, ContentModel, PublicationModel };