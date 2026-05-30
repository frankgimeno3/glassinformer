import { Op, QueryTypes } from "sequelize";
import {
    PublicationModel,
    PublicationSlotDbModel,
    PublicationArticleDbModel,
    PublicationArticleChunkDbModel,
} from "../../database/models.js";
import { formatMagazinePageLayoutForApi } from "../publication_workflow/magazinePageLayout.js";
import "../../database/models.js";

function toPlain(row) {
    return row && typeof row.get === "function" ? row.get({ plain: true }) : row;
}

function numOrNull(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

function toApiSlot(row) {
    const s = toPlain(row);
    if (!s) return null;
    const publication_page = numOrNull(s.publication_page);
    const slot_ordinal = numOrNull(s.slot_ordinal);
    return {
        publication_slot_id: s.publication_slot_id,
        publication_id: s.publication_id ?? null,
        publication_format: s.publication_format ?? "flipbook",
        slot_key: s.slot_key ?? "",
        publication_page,
        slot_ordinal,
        slot_content_type: s.slot_content_type ?? "",
        slot_state: s.slot_state ?? "",
        customer_id: s.customer_id ?? null,
        project_id: s.project_id ?? null,
        slot_media_url: s.slot_media_url ?? null,
        slot_flatplan_image_url: s.slot_flatplan_image_url ?? null,
        slot_article_id: s.slot_article_id ?? null,
        magazine_page_layout: formatMagazinePageLayoutForApi(
            s.slot_content_type,
            s.magazine_page_layout
        ),
        slot_created_at: s.slot_created_at ?? null,
        slot_updated_at: s.slot_updated_at ?? null,
        flatplan_publication_article_id: null,
        flatplan_article_page_index: null,
        flatplan_article_page_total: null,
        flatplan_article_chunks_in_slot: null,
        flatplan_publication_article_state: null,
        flatplan_preview_chunks: null,
        flatplan_cover_composite_url: null,
        flatplan_summary_pdf_url: null,
        flatplan_index_pdf_url: null,
    };
}

async function enrichSlotsWithFlatplanPublicationArticleMeta(slots, publicationId) {
    if (!Array.isArray(slots) || slots.length === 0) return;
    if (!PublicationArticleDbModel?.sequelize) return;

    const pid = String(publicationId);

    const articles = await PublicationArticleDbModel.findAll({
        where: { publication_id: pid },
        attributes: [
            "publication_article_id",
            "publication_slots_id_array",
            "desired_page_count",
            "publication_article_state",
        ],
    });

    /** @type {Map<number, { publication_article_id: string, pageIndex1: number, pageTotal: number, publication_article_state: string }>} */
    const slotArticleMeta = new Map();

    for (const row of articles) {
        const pa = toPlain(row);
        if (!pa?.publication_article_id) continue;
        const paId = String(pa.publication_article_id);
        const stateRaw = pa.publication_article_state;
        const publication_article_state =
            stateRaw != null && String(stateRaw).trim() !== ""
                ? String(stateRaw).trim()
                : "unfinished";
        const arr = Array.isArray(pa.publication_slots_id_array) ? pa.publication_slots_id_array : [];
        const desired = Math.max(1, Math.round(Number(pa.desired_page_count)) || 1);
        const pageTotal = Math.max(desired, arr.length, 1);
        for (let i = 0; i < arr.length; i++) {
            const sid = Number(arr[i]);
            if (!Number.isFinite(sid)) continue;
            if (slotArticleMeta.has(sid)) continue;
            slotArticleMeta.set(sid, {
                publication_article_id: paId,
                pageIndex1: i + 1,
                pageTotal,
                publication_article_state,
            });
        }
    }

    if (slotArticleMeta.size === 0) return;

    const slotIds = [...slotArticleMeta.keys()];
    /** @type {Map<string, number>} */
    const chunkCountByPair = new Map();
    if (slotIds.length > 0 && PublicationArticleChunkDbModel?.sequelize) {
        const chunkRows = await PublicationArticleChunkDbModel.findAll({
            where: {
                publication_id: pid,
                publication_slot_id: { [Op.in]: slotIds },
            },
            attributes: ["publication_article_id", "publication_slot_id"],
        });
        for (const ch of chunkRows) {
            const pl = toPlain(ch);
            const paid = pl.publication_article_id != null ? String(pl.publication_article_id) : "";
            const psid = Number(pl.publication_slot_id);
            if (!paid || !Number.isFinite(psid)) continue;
            const k = `${paid}:${psid}`;
            chunkCountByPair.set(k, (chunkCountByPair.get(k) ?? 0) + 1);
        }
    }

    for (const s of slots) {
        const sid = Number(s.publication_slot_id);
        const meta = slotArticleMeta.get(sid);
        if (!meta) continue;
        const chunks = chunkCountByPair.get(`${meta.publication_article_id}:${sid}`) ?? 0;
        s.flatplan_publication_article_id = meta.publication_article_id;
        s.flatplan_article_page_index = meta.pageIndex1;
        s.flatplan_article_page_total = meta.pageTotal;
        s.flatplan_article_chunks_in_slot = chunks;
        s.flatplan_publication_article_state = meta.publication_article_state;
    }
}

async function enrichSlotsWithFlatplanArticleChunkPreviews(slots, publicationId) {
    if (!Array.isArray(slots) || slots.length === 0) return;
    if (!PublicationArticleChunkDbModel?.sequelize) return;

    const pid = String(publicationId);
    const articleSlotIds = slots
        .filter((s) => String(s.slot_content_type ?? "").trim().toLowerCase() === "article")
        .map((s) => Number(s.publication_slot_id))
        .filter((n) => Number.isFinite(n) && n > 0);

    for (const s of slots) {
        s.flatplan_preview_chunks = null;
    }

    if (articleSlotIds.length === 0) return;

    const chunkRows = await PublicationArticleChunkDbModel.findAll({
        where: {
            publication_id: pid,
            publication_slot_id: { [Op.in]: articleSlotIds },
        },
        attributes: [
            "publication_slot_id",
            "publication_article_chunk_id",
            "publication_article_chunk_format",
            "chunk_html",
            "chunk_position",
        ],
        order: [
            ["publication_slot_id", "ASC"],
            ["chunk_position", "ASC"],
        ],
    });

    /** @type {Map<number, object[]>} */
    const bySlotId = new Map();
    for (const row of chunkRows) {
        const pl = toPlain(row);
        const sid = Number(pl.publication_slot_id);
        if (!Number.isFinite(sid) || sid <= 0) continue;
        const list = bySlotId.get(sid) ?? [];
        list.push({
            publication_article_chunk_id: String(pl.publication_article_chunk_id ?? ""),
            publication_article_chunk_format: String(pl.publication_article_chunk_format ?? ""),
            chunk_html: String(pl.chunk_html ?? ""),
            chunk_position: Number(pl.chunk_position) || 0,
        });
        bySlotId.set(sid, list);
    }

    for (const s of slots) {
        const sid = Number(s.publication_slot_id);
        const chunks = bySlotId.get(sid);
        if (chunks && chunks.length > 0) {
            s.flatplan_preview_chunks = chunks;
        }
    }
}

async function enrichSummaryAndIndexSlotsWithPdf(list, publicationId) {
    if (!list?.length || !PublicationModel?.sequelize) return;
    let indexUrl = "";
    let summaryUrl = "";
    try {
        const rows = await PublicationModel.sequelize.query(
            `SELECT publication_index_pdf_url, publication_summary_pdf_url
             FROM publications_db
             WHERE publication_id = :pid
             LIMIT 1`,
            { replacements: { pid: String(publicationId) }, type: QueryTypes.SELECT }
        );
        const pub = rows?.[0] ?? {};
        indexUrl = String(pub.publication_index_pdf_url ?? "").trim();
        summaryUrl = String(pub.publication_summary_pdf_url ?? "").trim();
    } catch {
        return;
    }
    if (!indexUrl && !summaryUrl) return;
    for (const s of list) {
        const t = String(s.slot_content_type ?? "").trim().toLowerCase();
        if (t === "index" && indexUrl) s.flatplan_index_pdf_url = indexUrl;
        if (t === "summary" && summaryUrl) s.flatplan_summary_pdf_url = summaryUrl;
    }
}

async function enrichCoverSlotWithFlatplanComposite(list, publicationId) {
    if (!list?.length || !PublicationModel?.sequelize) return;
    let url = "";
    try {
        const rows = await PublicationModel.sequelize.query(
            `SELECT publication_cover_flatplan_image_url
             FROM publications_db
             WHERE publication_id = :pid
             LIMIT 1`,
            { replacements: { pid: String(publicationId) }, type: QueryTypes.SELECT }
        );
        url = String(rows?.[0]?.publication_cover_flatplan_image_url ?? "").trim();
    } catch {
        return;
    }
    if (!url) return;
    for (const s of list) {
        if (String(s.slot_key ?? "").trim().toLowerCase() === "cover") {
            s.flatplan_cover_composite_url = url;
        }
    }
}

function slotSortKey(slotKey, publicationPage) {
    const k = String(slotKey || "").toLowerCase();
    const pp = numOrNull(publicationPage);
    if (k === "cover") return { group: 0, n: -1, raw: k };
    if (k === "inside_cover") return { group: 1, n: 0, raw: k };
    if (k === "preferential_page" && pp != null) return { group: 2, n: pp, raw: k };
    if (k === "regular_page") return { group: 3, n: pp ?? 9999, raw: k };
    if (k === "end") return { group: 4, n: pp ?? 10, raw: k };
    return { group: 9, n: pp ?? 9999, raw: k };
}

function compareSlotsPublicationOrder(a, b) {
    const ao = a.slot_ordinal;
    const bo = b.slot_ordinal;
    const aHas = ao != null && Number.isFinite(Number(ao));
    const bHas = bo != null && Number.isFinite(Number(bo));
    if (aHas && bHas && Number(ao) !== Number(bo)) {
        return Number(ao) - Number(bo);
    }
    const ap = a.publication_page;
    const bp = b.publication_page;
    const apHas = ap != null && Number.isFinite(Number(ap));
    const bpHas = bp != null && Number.isFinite(Number(bp));
    if (apHas && bpHas && Number(ap) !== Number(bp)) {
        return Number(ap) - Number(bp);
    }
    const ka = slotSortKey(a.slot_key, ap);
    const kb = slotSortKey(b.slot_key, bp);
    if (ka.group !== kb.group) return ka.group - kb.group;
    if (ka.n !== kb.n) return ka.n - kb.n;
    const rawCmp = ka.raw.localeCompare(kb.raw);
    if (rawCmp !== 0) return rawCmp;
    return Number(a.publication_slot_id) - Number(b.publication_slot_id);
}

/**
 * Read-only flatplan slots for a publication (same enrichments as central panel preview).
 */
export async function listPublicationSlotsForFlipbook(publicationId) {
    if (!publicationId?.trim()) return [];
    if (!PublicationSlotDbModel?.sequelize) return [];

    const pid = String(publicationId).trim();
    const rows = await PublicationSlotDbModel.findAll({
        where: { publication_id: pid },
    });

    const list = rows.map(toApiSlot).filter(Boolean);
    await enrichSlotsWithFlatplanPublicationArticleMeta(list, pid);
    await enrichSlotsWithFlatplanArticleChunkPreviews(list, pid);
    await enrichCoverSlotWithFlatplanComposite(list, pid);
    await enrichSummaryAndIndexSlotsWithPdf(list, pid);
    list.sort(compareSlotsPublicationOrder);
    return list;
}
