import TimeLogModel from "../features/timeLog/TimeLogModel.js";
import ModificationModel from "../features/modification/ModificationModel.js";
import CompanyModel from "../features/company/CompanyModel.js";
import ProductModel from "../features/product/ProductModel.js";
import ArticleModel from "../features/article/ArticleModel.js";
import CommentModel from "../features/comment/CommentModel.js";
import UserProfileModel from "../features/userProfile/UserProfileModel.js";

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

    ArticleModel.hasMany(CommentModel, {
        foreignKey: 'id_article',
        as: 'comments',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })

    CommentModel.belongsTo(ArticleModel, {
        foreignKey: 'id_article',
        as: 'article'
    })

    UserProfileModel.hasMany(CommentModel, {
        foreignKey: 'comment_id_user',
        targetKey: 'id_user',
        as: 'comments'
    })

    CommentModel.belongsTo(UserProfileModel, {
        foreignKey: 'comment_id_user',
        targetKey: 'id_user',
        as: 'user'
    })
}