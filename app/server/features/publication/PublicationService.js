import PublicationModel from "./PublicationModel.js";
import "../../database/models.js";
import { QueryTypes } from "sequelize";
import {
    portal_id,
    publicationCoverUrlTemplate,
} from "../../../GlassInformerSpecificData.js";

function buildPublicationCoverFromTemplate(row) {
    const t = (publicationCoverUrlTemplate || '').trim();
    if (!t) return '';
    if (t.includes('{id_magazine}')) {
        const mid = row.id_magazine == null ? '' : String(row.id_magazine).trim();
        if (!mid) return '';
    }
    const n = row.pub_numero ?? row.número ?? row.numero ?? row.pub_issue_number ?? '';
    const safe = (v) => encodeURIComponent(v == null ? '' : String(v));
    return t
        .replace(/\{id_magazine\}/g, safe(row.id_magazine))
        .replace(/\{id_publication\}/g, safe(row.id_publication))
        .replace(/\{número\}/g, safe(n))
        .replace(/\{issue_number\}/g, safe(row.pub_issue_number))
        .replace(/\{edition_name\}/g, safe(row.edition_name));
}

function mapPublicationToApi(row) {
    let publication_main_image_url = (row.publication_main_image_url || '').trim();
    if (!publication_main_image_url) {
        publication_main_image_url = buildPublicationCoverFromTemplate(row);
    }
    const edition = row.edition_name == null ? '' : String(row.edition_name).trim();
    return {
        id_publication: row.id_publication,
        // publications_db has no external link column in current RDS schema; keep API shape stable.
        redirectionLink: '',
        date: row.date ? new Date(row.date).toISOString().split('T')[0] : null,
        revista: edition || row.revista,
        número: row.pub_numero ?? row.número ?? row.numero ?? '',
        publication_main_image_url,
    };
}

export async function getAllPublications() {
    try {
        if (!PublicationModel.sequelize) {
            console.warn('PublicationModel not initialized, returning empty array');
            return [];
        }

        // Canonical RDS schema (see plynium_central_panel/server/database/migrations):
        // - magazine_portals: preferred mapping portal_id → magazine_id (migration 077).
        // - portals_db.magazine_id_array: legacy array scope.
        // - publications_db + magazines_db: issue rows and titles.
        const baseSelect = `SELECT
                p.publication_id AS id_publication,
                p.publication_main_image_url,
                p.magazine_id AS id_magazine,
                p.publication_edition_name AS edition_name,
                COALESCE(p.magazine_general_issue_number, p.magazine_this_year_issue)::text AS pub_numero,
                p.real_publication_month_date AS date,
                COALESCE(m.magazine_name, '') AS revista
             FROM public.publications_db p
             LEFT JOIN public.magazines_db m
               ON m.magazine_id = p.magazine_id`;

        const orderBy = `ORDER BY sub.date DESC NULLS LAST`;

        const queryViaMagazinePortals = async () =>
            PublicationModel.sequelize.query(
                `SELECT
                sub.*
             FROM (
               ${baseSelect}
             ) sub
             INNER JOIN public.magazine_portals mp
               ON mp.portal_id = :portalId
              AND mp.magazine_id = sub.id_magazine
             ${orderBy}`,
                { replacements: { portalId: portal_id }, type: QueryTypes.SELECT }
            );

        const queryViaMagazineIdArray = async () =>
            PublicationModel.sequelize.query(
                `SELECT
                sub.*
             FROM (
               ${baseSelect}
             ) sub
             INNER JOIN public.portals_db pd
               ON pd.portal_id = :portalId
              AND sub.id_magazine = ANY(COALESCE(pd.magazine_id_array, ARRAY[]::character varying[]))
             ${orderBy}`,
                { replacements: { portalId: portal_id }, type: QueryTypes.SELECT }
            );

        const relationMissing = (err, name) => {
            const msg = String(err?.message || "");
            return (
                msg.includes(name) &&
                (msg.includes("does not exist") || msg.includes("n'existe pas"))
            );
        };

        let magazinePortalsConfigured = false;
        try {
            const cntRows = await PublicationModel.sequelize.query(
                `SELECT COUNT(*)::integer AS c
                 FROM public.magazine_portals
                 WHERE portal_id = :portalId`,
                { replacements: { portalId: portal_id }, type: QueryTypes.SELECT }
            );
            const c = cntRows?.[0]?.c;
            magazinePortalsConfigured = Number(c) > 0;
        } catch (e) {
            if (relationMissing(e, "magazine_portals")) {
                console.warn(
                    `[PublicationService] magazine_portals not available (${e.message}). Using legacy scoping.`
                );
                magazinePortalsConfigured = false;
            } else {
                throw e;
            }
        }

        if (magazinePortalsConfigured) {
            const scopedRows = await queryViaMagazinePortals();
            return (scopedRows || []).map(mapPublicationToApi);
        }

        const scopedRows = await queryViaMagazineIdArray();

        if (scopedRows && scopedRows.length > 0) {
            return scopedRows.map(mapPublicationToApi);
        }

        console.warn(
            `[PublicationService] No publications matched portal ${portal_id} via portals_db.magazine_id_array. ` +
                "Falling back to unscoped publications list."
        );

        const rows = await PublicationModel.sequelize.query(
            `${baseSelect}
             ORDER BY p.real_publication_month_date DESC NULLS LAST, p.publication_year DESC NULLS LAST`,
            { type: QueryTypes.SELECT }
        );
        return (rows || []).map(mapPublicationToApi);
    } catch (error) {
        console.error('Error fetching publications from database:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        // If it's a connection error, table doesn't exist, column missing, or model not initialized, 
        // return empty array instead of throwing to prevent frontend crashes
        if (error.name === 'SequelizeConnectionError' || 
            error.name === 'SequelizeDatabaseError' ||
            error.name === 'SequelizeConnectionRefusedError' ||
            error.message?.includes('ETIMEDOUT') ||
            error.message?.includes('ECONNREFUSED') ||
            (error.message?.includes('relation') && error.message?.includes('does not exist')) ||
            (error.message?.includes('column') && error.message?.includes('does not exist')) ||
            error.message?.includes('not initialized') ||
            error.message?.includes('Model not found') ||
            error.message?.includes('[PublicationService] publications column mapping incomplete')) {
            console.warn('Database issue, returning empty array');
            return [];
        }
        // For other errors, still throw to maintain error visibility
        throw error;
    }
}

export async function getPublicationById(idPublication) {
    try {
        if (!PublicationModel.sequelize) {
            throw new Error('PublicationModel not initialized');
        }

        // For detail view, do not depend on portals_db.magazine_id_array being populated.
        // We still show the publication if it exists.
        const rows = await PublicationModel.sequelize.query(
            `SELECT
                p.publication_id AS id_publication,
                p.publication_main_image_url,
                p.magazine_id AS id_magazine,
                p.publication_edition_name AS edition_name,
                COALESCE(p.magazine_general_issue_number, p.magazine_this_year_issue)::text AS pub_numero,
                p.real_publication_month_date AS date,
                COALESCE(m.magazine_name, '') AS revista
             FROM public.publications_db p
             LEFT JOIN public.magazines_db m
               ON m.magazine_id = p.magazine_id
             WHERE p.publication_id = :id
             LIMIT 1`,
            { replacements: { id: idPublication }, type: QueryTypes.SELECT }
        );
        const row = rows?.[0];
        if (!row) {
            throw new Error(`Publication with id ${idPublication} not found`);
        }

        return mapPublicationToApi(row);
    } catch (error) {
        console.error('Error fetching publication from database:', error);
        throw error;
    }
}

export async function createPublication(publicationData) {
    const requestId = `publication_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[PublicationService] [${requestId}] Starting createPublication`);
    
    try {
        // Check if model is initialized
        if (!PublicationModel.sequelize) {
            console.error(`[PublicationService] [${requestId}] PublicationModel not initialized`);
            throw new Error('PublicationModel not initialized');
        }

        const dbConfig = PublicationModel.sequelize.config;
        console.log(`[PublicationService] [${requestId}] Database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
        console.log(`[PublicationService] [${requestId}] Creating publication with data:`, JSON.stringify(publicationData, null, 2));

        // publications_db schema does not match the legacy PublicationModel columns.
        // Keep this endpoint for now, but write via raw SQL against canonical columns.
        const id = String(publicationData.publication_id || publicationData.id_publication || '').trim();
        if (!id) throw new Error('publication_id is required');

        await PublicationModel.sequelize.query(
            `INSERT INTO public.publications_db (publication_id, magazine_id, publication_main_image_url)
             VALUES (:id, :magazineId, :img)
             ON CONFLICT (publication_id) DO NOTHING`,
            {
                replacements: {
                    id,
                    magazineId: (publicationData.magazine_id || publicationData.id_magazine || '').trim() || null,
                    img: (publicationData.publication_main_image_url || '').trim() || null,
                },
                type: QueryTypes.INSERT,
            }
        );
        
        console.log(`[PublicationService] [${requestId}] Publication created successfully:`, id);
        return await getPublicationById(id);
    } catch (error) {
        console.error(`[PublicationService] [${requestId}] Error creating publication in database`);
        console.error(`[PublicationService] [${requestId}] Error name:`, error.name);
        console.error(`[PublicationService] [${requestId}] Error message:`, error.message);
        console.error(`[PublicationService] [${requestId}] Error stack:`, error.stack);

        // Log connection details if it's a connection error
        if (error.name === 'SequelizeConnectionError' || error.message?.includes('ETIMEDOUT')) {
            const dbConfig = PublicationModel.sequelize?.config;
            if (dbConfig) {
                console.error(`[PublicationService] [${requestId}] Attempted connection to: ${dbConfig.host}:${dbConfig.port}`);
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

export async function updatePublication(idPublication, publicationData) {
    try {
        if (!PublicationModel.sequelize) throw new Error('PublicationModel not initialized');

        await PublicationModel.sequelize.query(
            `UPDATE public.publications_db
             SET
               publication_main_image_url = COALESCE(:img, publication_main_image_url),
               publication_edition_name = COALESCE(:edition, publication_edition_name),
               publication_theme = COALESCE(:theme, publication_theme),
               publication_status = COALESCE(:status, publication_status),
               publication_format = COALESCE(:format, publication_format)
             WHERE publication_id = :id`,
            {
                replacements: {
                    id: idPublication,
                    img:
                        publicationData.publication_main_image_url !== undefined
                            ? (publicationData.publication_main_image_url || '').trim() || null
                            : null,
                    edition:
                        publicationData.publication_edition_name !== undefined
                            ? (publicationData.publication_edition_name || '').trim() || null
                            : null,
                    theme:
                        publicationData.publication_theme !== undefined
                            ? (publicationData.publication_theme || '').trim() || null
                            : null,
                    status:
                        publicationData.publication_status !== undefined
                            ? (publicationData.publication_status || '').trim() || null
                            : null,
                    format:
                        publicationData.publication_format !== undefined
                            ? (publicationData.publication_format || '').trim() || null
                            : null,
                },
                type: QueryTypes.UPDATE,
            }
        );

        return await getPublicationById(idPublication);
    } catch (error) {
        console.error('Error updating publication in database:', error);
        throw error;
    }
}

export async function deletePublication(idPublication) {
    try {
        if (!PublicationModel.sequelize) throw new Error('PublicationModel not initialized');

        const existing = await getPublicationById(idPublication);
        await PublicationModel.sequelize.query(
            `DELETE FROM public.publications_db WHERE publication_id = :id`,
            { replacements: { id: idPublication }, type: QueryTypes.DELETE }
        );
        return existing;
    } catch (error) {
        console.error('Error deleting publication from database:', error);
        throw error;
    }
}



