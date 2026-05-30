export type FlatplanPreviewChunk = {
  publication_article_chunk_id: string;
  publication_article_chunk_format: string;
  chunk_html: string;
  chunk_position: number;
};

export type PublicationSlotRow = {
  publication_slot_id: number;
  publication_id: string | null;
  publication_format: string;
  slot_key: string;
  publication_page: number;
  slot_ordinal: number;
  slot_content_type: string;
  slot_state: string;
  customer_id: string | null;
  project_id: string | null;
  slot_media_url: string | null;
  slot_flatplan_image_url?: string | null;
  slot_article_id: string | null;
  magazine_page_layout?: string | null;
  flatplan_publication_article_id?: string | null;
  flatplan_article_page_index?: number | null;
  flatplan_article_page_total?: number | null;
  flatplan_preview_chunks?: FlatplanPreviewChunk[] | null;
  flatplan_cover_composite_url?: string | null;
  flatplan_summary_pdf_url?: string | null;
  flatplan_index_pdf_url?: string | null;
};

export type SlotContentTypeOption =
  | "article"
  | "advert"
  | "summary"
  | "index"
  | "cover"
  | "";

export function normalizeSlotContentType(value: unknown): SlotContentTypeOption {
  const s = String(value ?? "")
    .trim()
    .toLowerCase();
  if (
    s === "article" ||
    s === "advert" ||
    s === "summary" ||
    s === "index" ||
    s === "cover"
  ) {
    return s;
  }
  return "";
}

export function isArticleSummaryHtml(value: string | null | undefined): boolean {
  const s = String(value ?? "").trim();
  if (!s) return false;
  if (s === "2_col_article" || s === "3_col_article") return false;
  return s.includes("article-summary") || s.startsWith("<");
}

export function isAdvertiserIndexHtml(value: string | null | undefined): boolean {
  const s = String(value ?? "").trim();
  if (!s) return false;
  if (s === "2_col_article" || s === "3_col_article") return false;
  return s.includes("advertiser-index") || s.startsWith("<");
}

export type SpreadViewData = {
  leftSlot: PublicationSlotRow | null;
  rightSlot: PublicationSlotRow | null;
};
