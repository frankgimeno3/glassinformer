/** @typedef {"2_col_article" | "3_col_article"} MagazinePageLayout */

export const DEFAULT_MAGAZINE_PAGE_LAYOUT = "2_col_article";

/**
 * @param {unknown} value
 * @returns {MagazinePageLayout}
 */
export function normalizeMagazinePageLayout(value) {
    const s = String(value ?? "").trim();
    return s === "3_col_article" ? "3_col_article" : "2_col_article";
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isAdvertiserIndexHtmlLayout(value) {
    const s = String(value ?? "").trim();
    if (!s) return false;
    if (s === "2_col_article" || s === "3_col_article") return false;
    return s.includes("advertiser-index") || s.startsWith("<");
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isArticleSummaryHtmlLayout(value) {
    const s = String(value ?? "").trim();
    if (!s) return false;
    if (s === "2_col_article" || s === "3_col_article") return false;
    return s.includes("article-summary") || s.startsWith("<");
}

/**
 * @param {unknown} slotContentType
 * @param {unknown} rawLayout
 * @returns {string}
 */
export function formatMagazinePageLayoutForApi(slotContentType, rawLayout) {
    const t = String(slotContentType ?? "").trim().toLowerCase();
    if (t === "index" && isAdvertiserIndexHtmlLayout(rawLayout)) {
        return String(rawLayout ?? "");
    }
    if (t === "summary" && isArticleSummaryHtmlLayout(rawLayout)) {
        return String(rawLayout ?? "");
    }
    return normalizeMagazinePageLayout(rawLayout);
}
