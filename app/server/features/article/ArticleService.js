import ArticleModel from "./ArticleModel.js";
// Ensure models are initialized by importing models.js
import "../../database/models.js";
import { readFileSync } from "fs";
import { join } from "path";

// Helper function to get fallback data from JSON
function getFallbackArticles() {
    try {
        // Try to read from the expected location
        const jsonPath = join(process.cwd(), 'app', 'contents', 'articlesContents.json');
        const fileContent = readFileSync(jsonPath, 'utf-8');
        const articles = JSON.parse(fileContent);
        
        // Filter by portal_id = glassinformer and ensure required fields
        return articles
            .filter(article => (article.portal_id ?? null) === 1)
            .map(article => ({
            id_article: article.id_article,
            articleTitle: article.articleTitle,
            articleSubtitle: article.articleSubtitle || '',
            article_main_image_url: article.article_main_image_url || '',
            company: article.company || '',
            date: article.date || new Date().toISOString().split('T')[0],
            portal_id: article.portal_id ?? null,
            article_tags_array: article.article_tags_array || [],
            contents_array: article.contents_array || [],
            highlited_position: article.highlited_position ?? '',
            isEventNews: article.isEventNews || false,
            is_article_event: article.is_article_event ?? article.isEventNews ?? false,
            event_id: article.event_id || null,
            article_countries_array: article.article_countries_array || [],
            article_region: article.article_region || '',
            author: article.author || '',
            contents: article.contents || []
        }));
    } catch (error) {
        console.error('Error reading fallback articles from JSON:', error);
        return [];
    }
}

const { QueryTypes } = require('sequelize');

function transformArticleToApiFormat(row) {
    const plain = row && typeof row.get === 'function' ? row.get({ plain: true }) : row;
    return {
        id_article: plain.id_article,
        articleTitle: plain.article_title ?? plain.articleTitle,
        articleSubtitle: plain.article_subtitle ?? plain.articleSubtitle ?? null,
        article_main_image_url: plain.article_main_image_url ?? null,
        company: plain.company ?? null,
        date: plain.date ? new Date(plain.date).toISOString().split('T')[0] : null,
        portal_id: plain.portal_id ?? null,
        article_tags_array: [],
        contents_array: [],
        highlited_position: plain.highlited_position ?? plain.highlight_position ?? plain.highlighted_position ?? "",
        is_article_event: plain.is_article_event ?? false,
        event_id: plain.event_id ?? null,
        comments_array: []
    };
}

export async function getAllArticles() {
    try {
        if (!ArticleModel.sequelize) {
            console.warn('ArticleModel not initialized, using fallback data from JSON');
            return getFallbackArticles();
        }

        // Prefer join with article_publications to get highlight_position (source of "Main article", "Position1", etc.)
        try {
            const rawRows = await ArticleModel.sequelize.query(
                `SELECT a.id_article, a.article_title, a.article_subtitle, a.article_main_image_url, a.company, a.date, a.portal_id, a.is_article_event, a.event_id,
                        COALESCE(ap.highlight_position, a.highlited_position, a.highlighted_position, '') AS highlited_position
                 FROM public.articles a
                 LEFT JOIN public.article_publications ap ON a.id_article = ap.article_id AND ap.portal_id = 1
                 WHERE a.portal_id = 1
                 ORDER BY a.date DESC`,
                { type: QueryTypes.SELECT }
            );
            if (rawRows && rawRows.length > 0) {
                return rawRows.map(transformArticleToApiFormat);
            }
        } catch (joinErr) {
            if (joinErr.message?.includes('article_publications') || joinErr.message?.includes('does not exist')) {
                // Fallback: query articles only
            } else {
                throw joinErr;
            }
        }

        let articles = await ArticleModel.findAll({
            where: { portal_id: 1 },
            order: [['date', 'DESC']]
        });

        if (!articles || articles.length === 0) {
            try {
                const rawRows = await ArticleModel.sequelize.query(
                    `SELECT id_article, article_title, article_subtitle, article_main_image_url, company, date, portal_id, is_article_event, event_id,
                            COALESCE(highlited_position, highlighted_position, '') AS highlited_position
                     FROM public.articles
                     WHERE portal_id = 1
                     ORDER BY date DESC`,
                    { type: QueryTypes.SELECT }
                );
                if (rawRows && rawRows.length > 0) {
                    return rawRows.map(transformArticleToApiFormat);
                }
            } catch (rawErr) {
                console.warn('Raw query fallback failed:', rawErr.message);
            }
            return getFallbackArticles();
        }

        return articles.map(a => transformArticleToApiFormat(a));
    } catch (error) {
        console.error('Error fetching articles from database:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        // If it's a connection error, table doesn't exist, or model not initialized, 
        // use fallback data from JSON instead of returning empty array
        if (error.name === 'SequelizeConnectionError' || 
            error.name === 'SequelizeDatabaseError' ||
            error.name === 'SequelizeConnectionRefusedError' ||
            error.message?.includes('ETIMEDOUT') ||
            error.message?.includes('ECONNREFUSED') ||
            (error.message?.includes('relation') && error.message?.includes('does not exist')) ||
            error.message?.includes('not initialized') ||
            error.message?.includes('Model not found')) {
            console.warn('Database connection issue, using fallback data from JSON');
            return getFallbackArticles();
        }
        // For other errors, still throw to maintain error visibility
        throw error;
    }
}

export async function getArticleById(idArticle) {
    try {
        const article = await ArticleModel.findByPk(idArticle);
        if (!article || article.portal_id !== 1) {
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
            portal_id: article.portal_id ?? null,
            article_tags_array: [],
            contents_array: [],
            highlited_position: article.highlited_position ?? "",
            is_article_event: article.is_article_event ?? false,
            event_id: article.event_id ?? null,
            comments_array: []
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
        
        // Transform API format to database format (DB has no article_tags_array/contents_array)
        const article = await ArticleModel.create({
            id_article: articleData.id_article,
            article_title: articleData.articleTitle,
            article_subtitle: articleData.articleSubtitle,
            article_main_image_url: articleData.article_main_image_url,
            company: articleData.company,
            date: articleData.date,
            portal_id: articleData.portal_id ?? null,
            highlited_position: articleData.highlited_position ?? "",
            is_article_event: articleData.is_article_event ?? false,
            event_id: articleData.event_id ?? null
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
            portal_id: article.portal_id ?? null,
            article_tags_array: [],
            contents_array: [],
            highlited_position: article.highlited_position ?? ""
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
        
        // Update fields (DB has no article_tags_array/contents_array)
        if (articleData.articleTitle !== undefined) article.article_title = articleData.articleTitle;
        if (articleData.articleSubtitle !== undefined) article.article_subtitle = articleData.articleSubtitle;
        if (articleData.article_main_image_url !== undefined) article.article_main_image_url = articleData.article_main_image_url;
        if (articleData.company !== undefined) article.company = articleData.company;
        if (articleData.date !== undefined) article.date = articleData.date;
        if (articleData.portal_id !== undefined) article.portal_id = articleData.portal_id;
        if (articleData.highlited_position !== undefined) article.highlited_position = articleData.highlited_position;
        if (articleData.is_article_event !== undefined) article.is_article_event = articleData.is_article_event;
        if (articleData.event_id !== undefined) article.event_id = articleData.event_id;
        
        await article.save();
        
        // Transform database format to API format
        return {
            id_article: article.id_article,
            articleTitle: article.article_title,
            articleSubtitle: article.article_subtitle,
            article_main_image_url: article.article_main_image_url,
            company: article.company,
            date: article.date ? new Date(article.date).toISOString().split('T')[0] : null,
            portal_id: article.portal_id ?? null,
            article_tags_array: [],
            contents_array: [],
            highlited_position: article.highlited_position ?? ""
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
            portal_id: article.portal_id ?? null,
            article_tags_array: [],
            contents_array: [],
            highlited_position: article.highlited_position ?? ""
        };
    } catch (error) {
        console.error('Error deleting article from database:', error);
        throw error;
    }
}



