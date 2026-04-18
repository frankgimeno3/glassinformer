import EventModel from "./EventModel.js";
import "../../database/models.js";
import { readFileSync } from "fs";
import { join } from "path";
import { rewriteDeprecatedSourceUnsplashUrl } from "../../../lib/remoteImage";
import { QueryTypes } from "sequelize";
import { portal_id } from "../../../GlassInformerSpecificData.js";

function getFallbackEvents() {
    try {
        const jsonPath = join(process.cwd(), 'app', 'contents', 'eventsContents.json');
        const fileContent = readFileSync(jsonPath, 'utf-8');
        const events = JSON.parse(fileContent);
        return events
            .filter((event) => (event.portal_id ?? null) === portal_id)
            .map((event) => ({
            id_fair: event.id_fair,
            event_name: event.event_name,
            country: event.country || '',
            main_description: event.main_description || '',
            region: event.region || '',
            start_date: event.start_date || '',
            end_date: event.end_date || '',
            location: event.location || '',
            event_main_image: rewriteDeprecatedSourceUnsplashUrl(event.event_main_image || '')
        }));
    } catch (error) {
        console.error('Error reading fallback events from JSON:', error);
        return [];
    }
}

function mapEventToApiFormat(event) {
    return {
        id_fair: event.id_fair,
        event_name: event.event_name,
        country: event.country || '',
        main_description: event.main_description || '',
        region: event.region || '',
        start_date: event.start_date ? String(event.start_date).split('T')[0] : '',
        end_date: event.end_date ? String(event.end_date).split('T')[0] : '',
        location: event.location || '',
        event_main_image: rewriteDeprecatedSourceUnsplashUrl(event.event_main_image || '')
    };
}

export async function getAllEvents() {
    try {
        if (!EventModel.sequelize) {
            console.warn('EventModel not initialized, using fallback data from JSON');
            return getFallbackEvents();
        }

        // Join with event_portals to filter by portal_id
        const rows = await EventModel.sequelize.query(
            `SELECT
                    e.event_id AS id_fair,
                    e.event_name,
                    e.event_country AS country,
                    e.event_main_description AS main_description,
                    e.event_region AS region,
                    e.event_start_date AS start_date,
                    e.event_end_date AS end_date,
                    e.event_location AS location,
                    e.event_main_image_src AS event_main_image
             FROM public.events_db e
             INNER JOIN public.event_portals ep ON e.event_id = ep.event_id AND ep.portal_id = :portalId
             ORDER BY e.event_start_date ASC`,
            { replacements: { portalId: portal_id }, type: QueryTypes.SELECT }
        );

        if (rows && rows.length > 0) {
            return rows.map((r) => mapEventToApiFormat(r));
        }

        console.warn(`No events for portal ${portal_id}, using fallback data from JSON`);
        return getFallbackEvents();
    } catch (error) {
        console.error('Error fetching events from database:', error);
        if (
            error.name === 'SequelizeConnectionError' ||
            error.name === 'SequelizeDatabaseError' ||
            error.name === 'SequelizeConnectionRefusedError' ||
            error.message?.includes('ETIMEDOUT') ||
            error.message?.includes('ECONNREFUSED') ||
            (error.message?.includes('relation') && error.message?.includes('does not exist')) ||
            (error.message?.includes('column') && error.message?.includes('does not exist')) ||
            error.message?.includes('not initialized') ||
            error.message?.includes('Model not found')
        ) {
            console.warn('Database issue, using fallback data from JSON');
            return getFallbackEvents();
        }
        throw error;
    }
}

export async function getEventById(idFair) {
    try {
        if (!EventModel.sequelize) {
            const fallback = getFallbackEvents();
            const found = fallback.find((e) => e.id_fair === idFair);
            if (!found) throw new Error(`Event with id ${idFair} not found`);
            return found;
        }

        const event = await EventModel.findByPk(idFair);
        if (!event) {
            const fallback = getFallbackEvents();
            const found = fallback.find((e) => e.id_fair === idFair);
            if (!found) throw new Error(`Event with id ${idFair} not found`);
            return found;
        }

        // Validate event belongs to portal via event_portals
        const [portalRow] = await EventModel.sequelize.query(
            `SELECT 1 FROM public.event_portals WHERE event_id = :eventId AND portal_id = :portalId`,
            { replacements: { eventId: idFair, portalId: portal_id }, type: QueryTypes.SELECT }
        );
        if (!portalRow) {
            throw new Error(`Event with id ${idFair} not found`);
        }

        return mapEventToApiFormat(event);
    } catch (error) {
        console.error('Error fetching event from database:', error);
        throw error;
    }
}

/**
 * Event News: articles linked via event_articles for events that belong to this portal.
 * Source of truth:
 * - event_portals: filters which events belong to portal
 * - event_articles: links event_id -> article_id
 * - article_portals: ensures article is published/public for this portal
 * - articles_db: article data
 */
export async function getEventNewsArticles() {
    if (!EventModel.sequelize) {
        return [];
    }
    const rows = await EventModel.sequelize.query(
        `SELECT DISTINCT
                a.id_article,
                a.article_title,
                a.article_subtitle,
                a.article_main_image_url,
                a.article_company_names_array,
                a.article_company_id_array,
                a.article_date AS date,
                a.is_article_event,
                a.article_event_id AS event_id
         FROM public.event_portals ep
         INNER JOIN public.event_articles ea
           ON ea.event_id = ep.event_id
         INNER JOIN public.article_portals ap
           ON ap.article_id = ea.article_id
          AND ap.article_portal_ref_id = ep.portal_id
          AND ap.article_status = 'published'
          AND ap.article_visibility = 'public'
         INNER JOIN public.articles_db a
           ON a.id_article = ea.article_id
         WHERE ep.portal_id = :portalId
         ORDER BY a.article_date DESC NULLS LAST`,
        { replacements: { portalId: portal_id }, type: QueryTypes.SELECT }
    );
    return (rows || []).map((r) => ({
        id_article: r.id_article,
        articleTitle: r.article_title ?? "",
        articleSubtitle: r.article_subtitle ?? "",
        article_main_image_url: rewriteDeprecatedSourceUnsplashUrl(r.article_main_image_url || ""),
        company: Array.isArray(r.article_company_names_array)
            ? r.article_company_names_array.join(", ")
            : "",
        date: r.date ? String(r.date).split("T")[0] : null,
        is_article_event: r.is_article_event === true,
        event_id: r.event_id ?? null,
    }));
}
