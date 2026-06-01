import { publicationCoverUrlTemplate } from "../../../GlassInformerSpecificData.js";

/** Keep in sync with `images.remotePatterns` in next.config.ts */
const DEFAULT_CLOUDFRONT_HOST = "djjo025o2wqll.cloudfront.net";

function cloudFrontHost() {
    const raw =
        process.env.NEXT_PUBLIC_CLOUDFRONT_URL ||
        process.env.CLOUDFRONT_URL ||
        DEFAULT_CLOUDFRONT_HOST;
    return String(raw).trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/**
 * Normalizes mediateca / S3 paths to absolute CloudFront URLs when needed.
 */
export function resolvePublicationMediaUrl(raw) {
    const u = String(raw ?? "").trim();
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    const host = cloudFrontHost();
    if (!host) return u;
    return `https://${host}/${u.replace(/^\//, "")}`;
}

function buildPublicationCoverFromTemplate(row) {
    const t = (publicationCoverUrlTemplate || "").trim();
    if (!t) return "";
    if (t.includes("{id_magazine}")) {
        const mid = row.id_magazine == null ? "" : String(row.id_magazine).trim();
        if (!mid) return "";
    }
    const n = row.pub_numero ?? row.número ?? row.numero ?? row.pub_issue_number ?? "";
    const safe = (v) => encodeURIComponent(v == null ? "" : String(v));
    return t
        .replace(/\{id_magazine\}/g, safe(row.id_magazine))
        .replace(/\{id_publication\}/g, safe(row.id_publication))
        .replace(/\{número\}/g, safe(n))
        .replace(/\{issue_number\}/g, safe(row.pub_issue_number))
        .replace(/\{edition_name\}/g, safe(row.edition_name));
}

/**
 * Cover thumbnail for list / sidebar: main image, flatplan composite, cover slot, then template.
 */
export function resolvePublicationCoverUrl(row) {
    const candidates = [
        row.publication_main_image_url,
        row.publication_cover_flatplan_image_url,
        row.cover_slot_media_url,
    ];
    for (const c of candidates) {
        const resolved = resolvePublicationMediaUrl(c);
        if (resolved) return resolved;
    }
    return buildPublicationCoverFromTemplate(row);
}
