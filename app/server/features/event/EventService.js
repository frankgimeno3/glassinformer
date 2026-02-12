import EventModel from "./EventModel.js";
import "../../database/models.js";
import { readFileSync } from "fs";
import { join } from "path";

function getFallbackEvents() {
    try {
        const jsonPath = join(process.cwd(), 'app', 'contents', 'eventsContents.json');
        const fileContent = readFileSync(jsonPath, 'utf-8');
        const events = JSON.parse(fileContent);
        return events.map((event) => ({
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

        const events = await EventModel.findAll({
            order: [['start_date', 'ASC']]
        });

        if (!events || events.length === 0) {
            console.warn('Events table empty, using fallback data from JSON');
            return getFallbackEvents();
        }

        return events.map((event) => mapEventToApiFormat(event));
    } catch (error) {
        console.error('Error fetching events from database:', error);
        if (
            error.name === 'SequelizeConnectionError' ||
            error.name === 'SequelizeDatabaseError' ||
            error.name === 'SequelizeConnectionRefusedError' ||
            error.message?.includes('ETIMEDOUT') ||
            error.message?.includes('ECONNREFUSED') ||
            (error.message?.includes('relation') && error.message?.includes('does not exist')) ||
            error.message?.includes('not initialized') ||
            error.message?.includes('Model not found')
        ) {
            console.warn('Database connection issue, using fallback data from JSON');
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

        return mapEventToApiFormat(event);
    } catch (error) {
        console.error('Error fetching event from database:', error);
        throw error;
    }
}
