import ArticleModel from "./ArticleModel.js";
// Ensure models are initialized by importing models.js
import "../../database/models.js";

export async function getAllArticles() {
    try {
        // Check if model is initialized
        if (!ArticleModel.sequelize) {
            console.warn('ArticleModel not initialized, returning empty array');
            return [];
        }

        const articles = await ArticleModel.findAll({
            order: [['date', 'DESC']]
        });
        
        // Transform database format to API format
        return articles.map(article => ({
            id_article: article.id_article,
            articleTitle: article.article_title,
            articleSubtitle: article.article_subtitle,
            article_main_image_url: article.article_main_image_url,
            company: article.company,
            date: article.date ? new Date(article.date).toISOString().split('T')[0] : null,
            article_tags_array: article.article_tags_array || [],
            contents_array: article.contents_array || []
        }));
    } catch (error) {
        console.error('Error fetching articles from database:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        // If it's a connection error, table doesn't exist, or model not initialized, 
        // return empty array instead of throwing to prevent frontend crashes
        if (error.name === 'SequelizeConnectionError' || 
            error.name === 'SequelizeDatabaseError' ||
            error.name === 'SequelizeConnectionRefusedError' ||
            error.message?.includes('ETIMEDOUT') ||
            error.message?.includes('ECONNREFUSED') ||
            (error.message?.includes('relation') && error.message?.includes('does not exist')) ||
            error.message?.includes('not initialized') ||
            error.message?.includes('Model not found')) {
            console.warn('Database connection issue, returning empty array');
            return [];
        }
        // For other errors, still throw to maintain error visibility
        throw error;
    }
}

export async function getArticleById(idArticle) {
    try {
        const article = await ArticleModel.findByPk(idArticle);
        if (!article) {
            throw new Error(`Article with id ${idArticle} not found`);
        }
        
        // Transform database format to API format
        return {
            id_article: article.id_article,
            articleTitle: article.article_title,
            articleSubtitle: article.article_subtitle,
            article_main_image_url: article.article_main_image_url,
            company: article.company,
            date: article.date ? new Date(article.date).toISOString().split('T')[0] : null,
            article_tags_array: article.article_tags_array || [],
            contents_array: article.contents_array || []
        };
    } catch (error) {
        console.error('Error fetching article from database:', error);
        throw error;
    }
}

export async function createArticle(articleData) {
    const requestId = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[ArticleService] [${requestId}] Starting createArticle`);
    
    try {
        // Check if model is initialized
        if (!ArticleModel.sequelize) {
            console.error(`[ArticleService] [${requestId}] ArticleModel not initialized`);
            throw new Error('ArticleModel not initialized');
        }

        const dbConfig = ArticleModel.sequelize.config;
        console.log(`[ArticleService] [${requestId}] Database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
        console.log(`[ArticleService] [${requestId}] Creating article with data:`, JSON.stringify(articleData, null, 2));
        
        // Transform API format to database format
        const article = await ArticleModel.create({
            id_article: articleData.id_article,
            article_title: articleData.articleTitle,
            article_subtitle: articleData.articleSubtitle,
            article_main_image_url: articleData.article_main_image_url,
            company: articleData.company,
            date: articleData.date,
            article_tags_array: articleData.article_tags_array || [],
            contents_array: articleData.contents_array || []
        });
        
        console.log(`[ArticleService] [${requestId}] Article created successfully:`, article.toJSON());
        
        // Transform database format to API format
        return {
            id_article: article.id_article,
            articleTitle: article.article_title,
            articleSubtitle: article.article_subtitle,
            article_main_image_url: article.article_main_image_url,
            company: article.company,
            date: article.date ? new Date(article.date).toISOString().split('T')[0] : null,
            article_tags_array: article.article_tags_array || [],
            contents_array: article.contents_array || []
        };
    } catch (error) {
        console.error(`[ArticleService] [${requestId}] Error creating article in database`);
        console.error(`[ArticleService] [${requestId}] Error name:`, error.name);
        console.error(`[ArticleService] [${requestId}] Error message:`, error.message);
        console.error(`[ArticleService] [${requestId}] Error stack:`, error.stack);
        
        // Log connection details if it's a connection error
        if (error.name === 'SequelizeConnectionError' || error.message?.includes('ETIMEDOUT')) {
            const dbConfig = ArticleModel.sequelize?.config;
            if (dbConfig) {
                console.error(`[ArticleService] [${requestId}] Attempted connection to: ${dbConfig.host}:${dbConfig.port}`);
            }
        }
        
        // Provide more detailed error information for connection errors
        if (error.name === 'SequelizeConnectionError' || 
            error.name === 'SequelizeDatabaseError' ||
            error.name === 'SequelizeConnectionRefusedError' ||
            error.message?.includes('ETIMEDOUT') ||
            error.message?.includes('ECONNREFUSED')) {
            const errorMsg = error.message || '';
            let helpfulMsg = `Database connection error: ${errorMsg}`;
            
            if (errorMsg.includes('ETIMEDOUT') || errorMsg.includes('ECONNREFUSED')) {
                helpfulMsg += '\n\nPossible solutions:\n';
                helpfulMsg += '1. Check if your IP is allowed in RDS Security Group\n';
                helpfulMsg += '2. Verify DATABASE_HOST, DATABASE_PORT in .env file\n';
                helpfulMsg += '3. Ensure RDS instance is running and publicly accessible\n';
                helpfulMsg += '4. Check your network/firewall settings\n';
                helpfulMsg += '5. Consider using SSH tunnel for secure connection';
            }
            
            throw new Error(helpfulMsg);
        }
        
        throw error;
    }
}

export async function updateArticle(idArticle, articleData) {
    try {
        const article = await ArticleModel.findByPk(idArticle);
        if (!article) {
            throw new Error(`Article with id ${idArticle} not found`);
        }
        
        // Update fields
        if (articleData.articleTitle !== undefined) article.article_title = articleData.articleTitle;
        if (articleData.articleSubtitle !== undefined) article.article_subtitle = articleData.articleSubtitle;
        if (articleData.article_main_image_url !== undefined) article.article_main_image_url = articleData.article_main_image_url;
        if (articleData.company !== undefined) article.company = articleData.company;
        if (articleData.date !== undefined) article.date = articleData.date;
        if (articleData.article_tags_array !== undefined) article.article_tags_array = articleData.article_tags_array;
        if (articleData.contents_array !== undefined) article.contents_array = articleData.contents_array;
        
        await article.save();
        
        // Transform database format to API format
        return {
            id_article: article.id_article,
            articleTitle: article.article_title,
            articleSubtitle: article.article_subtitle,
            article_main_image_url: article.article_main_image_url,
            company: article.company,
            date: article.date ? new Date(article.date).toISOString().split('T')[0] : null,
            article_tags_array: article.article_tags_array || [],
            contents_array: article.contents_array || []
        };
    } catch (error) {
        console.error('Error updating article in database:', error);
        throw error;
    }
}

export async function deleteArticle(idArticle) {
    try {
        const article = await ArticleModel.findByPk(idArticle);
        if (!article) {
            throw new Error(`Article with id ${idArticle} not found`);
        }
        
        await article.destroy();
        
        // Transform database format to API format
        return {
            id_article: article.id_article,
            articleTitle: article.article_title,
            articleSubtitle: article.article_subtitle,
            article_main_image_url: article.article_main_image_url,
            company: article.company,
            date: article.date ? new Date(article.date).toISOString().split('T')[0] : null,
            article_tags_array: article.article_tags_array || [],
            contents_array: article.contents_array || []
        };
    } catch (error) {
        console.error('Error deleting article from database:', error);
        throw error;
    }
}



