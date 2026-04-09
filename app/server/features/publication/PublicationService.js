import PublicationModel from "./PublicationModel.js";
import "../../database/models.js";
import { QueryTypes } from "sequelize";
import {
    portal_id,
    publicationPortalDbValue,
    publicationCoverUrlTemplate,
} from "../../../GlassInformerSpecificData.js";

/** Resolved physical column names (null until first successful resolve). */
let publicationColumnsCached = null;
let publicationColumnsInFlight = null;

/** How we bind publications to the current portal (publication_portals join vs publications.portal_id). */
let publicationPortalBindingCached = null;
let publicationPortalBindingInFlight = null;

function pgQuoteIdent(name) {
    return `"${String(name).replace(/"/g, '""')}"`;
}

function pickColumn(existingSet, candidates) {
    for (const c of candidates) {
        if (existingSet.has(c)) return c;
    }
    return null;
}

/** Filter on publications.portal (or legacy revista) using GlassInformerSpecificData.publicationPortalDbValue. */
function buildPublicationPortalStringWhereClause(brandPhysicalCol, tableAlias, q) {
    const v = (publicationPortalDbValue ?? '').trim();
    if (!v) return '';
    return ` AND LOWER(TRIM(${tableAlias}.${q(brandPhysicalCol)})) = LOWER(TRIM(:publicationPortalDbValue)) `;
}

/**
 * If RDS has a varchar `portal` column and we filter by publicationPortalDbValue, that already scopes rows.
 * INNER JOIN publication_portals then drops every row when the junction table is empty or out of sync — skip join in that case.
 */
function hasPublicationsPortalVarcharColumn(cols) {
    return String(cols.revista || '').toLowerCase() === 'portal';
}

function shouldJoinPublicationPortalsTable(binding, cols) {
    if (binding.kind !== 'junction') return false;
    const portalKey = (publicationPortalDbValue ?? '').trim();
    if (!portalKey) return true;
    if (hasPublicationsPortalVarcharColumn(cols)) return false;
    return true;
}

function buildPublicationCoverFromTemplate(row) {
    const t = (publicationCoverUrlTemplate || '').trim();
    if (!t) return '';
    if (t.includes('{id_magazine}')) {
        const mid = row.id_magazine == null ? '' : String(row.id_magazine).trim();
        if (!mid) return '';
    }
    const n = row.pub_numero ?? row.número ?? row.numero ?? '';
    const safe = (v) => encodeURIComponent(v == null ? '' : String(v));
    return t
        .replace(/\{id_magazine\}/g, safe(row.id_magazine))
        .replace(/\{id_publication\}/g, safe(row.id_publication))
        .replace(/\{número\}/g, safe(n))
        .replace(/\{issue_number\}/g, safe(row.pub_issue_number))
        .replace(/\{edition_name\}/g, safe(row.edition_name));
}

async function resolvePublicationPortalBinding(sequelize) {
    if (publicationPortalBindingCached) return publicationPortalBindingCached;
    if (!publicationPortalBindingInFlight) {
        publicationPortalBindingInFlight = (async () => {
            const [existsRow] = await sequelize.query(
                `SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'publication_portals'
                ) AS ex`,
                { type: QueryTypes.SELECT }
            );
            if (!existsRow?.ex) {
                return { kind: 'no_junction' };
            }
            const rows = await sequelize.query(
                `SELECT column_name FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = 'publication_portals'`,
                { type: QueryTypes.SELECT }
            );
            const set = new Set(rows.map((r) => r.column_name));
            const publicationIdCol = pickColumn(set, ['publication_id', 'id_publication']);
            const portalIdCol = pickColumn(set, ['portal_id', 'id_portal']);
            if (!publicationIdCol || !portalIdCol) {
                return { kind: 'no_junction' };
            }
            return { kind: 'junction', publicationIdCol, portalIdCol };
        })();
    }
    try {
        publicationPortalBindingCached = await publicationPortalBindingInFlight;
        return publicationPortalBindingCached;
    } catch (e) {
        publicationPortalBindingInFlight = null;
        throw e;
    }
}

/**
 * Maps logical publication fields to actual RDS column names (cached per process).
 * Supports schemas where e.g. link lives in `url` or `link` instead of `redirection_link`.
 */
async function resolvePublicationsPhysicalColumns(sequelize) {
    if (publicationColumnsCached) return publicationColumnsCached;
    if (!publicationColumnsInFlight) {
        publicationColumnsInFlight = (async () => {
            const rows = await sequelize.query(
                `SELECT column_name
                 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name IN ('publications_db', 'publications')`,
                { type: QueryTypes.SELECT }
            );
            const set = new Set(rows.map((r) => r.column_name));

            const id_publication = pickColumn(set, ['id_publication', 'id']);
            const redirection_link = pickColumn(set, [
                'redirection_link',
                'redirectionLink',
                'redirectionlink',
                'external_link',
                'publication_url',
                'publication_link',
                'external_url',
                'url',
                'link',
            ]);
            const date = pickColumn(set, [
                'date',
                'publication_date',
                'pub_date',
                'published_at',
            ]);
            // RDS may use `portal` (magazine key per row) or legacy `revista`.
            const revista = pickColumn(set, [
                'portal',
                'revista',
                'title',
                'magazine_name',
                'magazine',
                'name',
            ]);
            const numero = pickColumn(set, [
                'número',
                'numero',
                'number',
                'issue_number',
                'num',
                'issue',
            ]);
            const publication_main_image_url = pickColumn(set, [
                'publication_main_image_url',
                'main_image_url',
                'cover_image_url',
                'image_url',
                'thumbnail_url',
            ]);
            const portal_id_col = pickColumn(set, ['portal_id', 'id_portal']);
            const id_magazine = pickColumn(set, ['id_magazine', 'magazine_id']);
            const issue_number = pickColumn(set, ['issue_number', 'issue_num', 'issue']);
            const edition_name = pickColumn(set, ['edition_name', 'edition_label']);

            // Link column is optional: some schemas (e.g. GlassInformer RDS) store no URL on publications.
            if (!id_publication || !date || !revista || !numero) {
                const found = [...set].sort().join(', ');
                throw new Error(
                    `[PublicationService] publications column mapping incomplete (columns in DB: ${found || 'none'}). ` +
                        'Need id_publication, date, portal|revista|title, and issue (número|issue_number|…).'
                );
            }

            return {
                id_publication,
                redirection_link,
                date,
                revista,
                numero,
                publication_main_image_url,
                portal_id_col,
                id_magazine,
                issue_number,
                edition_name,
            };
        })();
    }
    try {
        publicationColumnsCached = await publicationColumnsInFlight;
        return publicationColumnsCached;
    } catch (e) {
        publicationColumnsInFlight = null;
        throw e;
    }
}

function publicationSelectListSql(cols) {
    const q = pgQuoteIdent;
    const img = cols.publication_main_image_url
        ? `p.${q(cols.publication_main_image_url)}`
        : `NULL::varchar`;
    const link = cols.redirection_link
        ? `p.${q(cols.redirection_link)}`
        : `NULL::varchar`;
    const idMag = cols.id_magazine ? `p.${q(cols.id_magazine)}` : `NULL::varchar`;
    const issueNum = cols.issue_number ? `p.${q(cols.issue_number)}` : `NULL::integer`;
    const edition = cols.edition_name ? `p.${q(cols.edition_name)}` : `NULL::varchar`;
    return `
        p.${q(cols.id_publication)} AS id_publication,
        ${link} AS redirection_link,
        p.${q(cols.date)} AS date,
        p.${q(cols.revista)} AS revista,
        p.${q(cols.numero)} AS pub_numero,
        ${img} AS publication_main_image_url,
        ${idMag} AS id_magazine,
        ${issueNum} AS pub_issue_number,
        ${edition} AS edition_name
    `;
}

function mapPublicationToApi(row) {
    const link = row.redirection_link;
    let publication_main_image_url = (row.publication_main_image_url || '').trim();
    if (!publication_main_image_url) {
        publication_main_image_url = buildPublicationCoverFromTemplate(row);
    }
    const edition = row.edition_name == null ? '' : String(row.edition_name).trim();
    return {
        id_publication: row.id_publication,
        redirectionLink: link == null || link === '' ? '' : String(link),
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

        const cols = await resolvePublicationsPhysicalColumns(PublicationModel.sequelize);
        const q = pgQuoteIdent;
        const binding = await resolvePublicationPortalBinding(PublicationModel.sequelize);

        let joinSql = '';
        let portalWhereSql = '';
        if (shouldJoinPublicationPortalsTable(binding, cols)) {
            joinSql =
                ` INNER JOIN public.publication_portals pp ON p.${q(cols.id_publication)} = pp.${q(binding.publicationIdCol)} ` +
                `AND pp.${q(binding.portalIdCol)} = :portalId `;
        } else if (cols.portal_id_col) {
            portalWhereSql = ` AND p.${q(cols.portal_id_col)} = :portalId `;
        } else {
            const scopedByPortalVarchar =
                (publicationPortalDbValue ?? '').trim() !== '' && hasPublicationsPortalVarcharColumn(cols);
            if (!scopedByPortalVarchar) {
                console.warn(
                    '[PublicationService] No junction join, no publications.portal_id, and no portal varchar scope; check publicationPortalDbValue and schema.'
                );
            }
        }

        const portalStringSql = buildPublicationPortalStringWhereClause(cols.revista, 'p', q);

        const rows = await PublicationModel.sequelize.query(
            `SELECT ${publicationSelectListSql(cols)}
             FROM public.publications_db p
             ${joinSql}
             WHERE 1=1
             ${portalWhereSql}
             ${portalStringSql}
             ORDER BY p.${q(cols.date)} DESC`,
            {
                replacements: {
                    portalId: portal_id,
                    publicationPortalDbValue: (publicationPortalDbValue ?? '').trim(),
                },
                type: QueryTypes.SELECT,
            }
        );
        
        if (rows && rows.length > 0) {
            return rows.map(mapPublicationToApi);
        }
        
        return [];
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

        const cols = await resolvePublicationsPhysicalColumns(PublicationModel.sequelize);
        const q = pgQuoteIdent;
        const binding = await resolvePublicationPortalBinding(PublicationModel.sequelize);

        let joinSql = '';
        let portalWhereSql = '';
        if (shouldJoinPublicationPortalsTable(binding, cols)) {
            joinSql =
                ` INNER JOIN public.publication_portals pp ON p.${q(cols.id_publication)} = pp.${q(binding.publicationIdCol)} ` +
                `AND pp.${q(binding.portalIdCol)} = :portalId `;
        } else if (cols.portal_id_col) {
            portalWhereSql = ` AND p.${q(cols.portal_id_col)} = :portalId `;
        }

        const portalStringSql = buildPublicationPortalStringWhereClause(cols.revista, 'p', q);

        const rows = await PublicationModel.sequelize.query(
            `SELECT ${publicationSelectListSql(cols)}
             FROM public.publications_db p
             ${joinSql}
             WHERE p.${q(cols.id_publication)} = :id
             ${portalWhereSql}
             ${portalStringSql}`,
            {
                replacements: {
                    id: idPublication,
                    portalId: portal_id,
                    publicationPortalDbValue: (publicationPortalDbValue ?? '').trim(),
                },
                type: QueryTypes.SELECT,
            }
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

        // Transform API format to database format
        const publication = await PublicationModel.create({
            id_publication: publicationData.id_publication,
            redirection_link: publicationData.redirectionLink,
            date: publicationData.date,
            revista: publicationData.revista,
            número: publicationData.número,
            publication_main_image_url: publicationData.publication_main_image_url || ""
        });
        
        console.log(`[PublicationService] [${requestId}] Publication created successfully:`, publication.toJSON());
        
        // Transform database format to API format
        return {
            id_publication: publication.id_publication,
            redirectionLink: publication.redirection_link,
            date: publication.date ? new Date(publication.date).toISOString().split('T')[0] : null,
            revista: publication.revista,
            número: publication.número,
            publication_main_image_url: publication.publication_main_image_url || ""
        };
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
        const publication = await PublicationModel.findByPk(idPublication);
        if (!publication) {
            throw new Error(`Publication with id ${idPublication} not found`);
        }
        
        // Update fields
        if (publicationData.redirectionLink !== undefined) publication.redirection_link = publicationData.redirectionLink;
        if (publicationData.date !== undefined) publication.date = publicationData.date;
        if (publicationData.revista !== undefined) publication.revista = publicationData.revista;
        if (publicationData.número !== undefined) publication.número = publicationData.número;
        if (publicationData.publication_main_image_url !== undefined) publication.publication_main_image_url = publicationData.publication_main_image_url;
        
        await publication.save();
        
        // Transform database format to API format
        return {
            id_publication: publication.id_publication,
            redirectionLink: publication.redirection_link,
            date: publication.date ? new Date(publication.date).toISOString().split('T')[0] : null,
            revista: publication.revista,
            número: publication.número,
            publication_main_image_url: publication.publication_main_image_url || ""
        };
    } catch (error) {
        console.error('Error updating publication in database:', error);
        throw error;
    }
}

export async function deletePublication(idPublication) {
    try {
        const publication = await PublicationModel.findByPk(idPublication);
        if (!publication) {
            throw new Error(`Publication with id ${idPublication} not found`);
        }
        
        await publication.destroy();
        
        // Transform database format to API format
        return {
            id_publication: publication.id_publication,
            redirectionLink: publication.redirection_link,
            date: publication.date ? new Date(publication.date).toISOString().split('T')[0] : null,
            revista: publication.revista,
            número: publication.número,
            publication_main_image_url: publication.publication_main_image_url || ""
        };
    } catch (error) {
        console.error('Error deleting publication from database:', error);
        throw error;
    }
}



