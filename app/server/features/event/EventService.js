import EventModel from "./EventModel.js";
import "../../database/models.js";
import { readFileSync } from "fs";
import { join } from "path";
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
            event_main_image: event.event_main_image || ''
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
        event_main_image: event.event_main_image || ''
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
            `SELECT e.id_fair, e.event_name, e.country, e.main_description, e.region,
                    e.start_date, e.end_date, e.location, e.event_main_image
             FROM public.events e
             INNER JOIN public.event_portals ep ON e.id_fair = ep.event_id AND ep.portal_id = :portalId
             ORDER BY e.start_date ASC`,
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
