"use client";

import {
  isAdvertiserIndexHtml,
  isArticleSummaryHtml,
  normalizeSlotContentType,
  type PublicationSlotRow,
} from "../flipbook_lib/slotTypes";
import { FlipbookMediaThumbnail } from "./FlipbookMediaThumbnail";

const PAGE_ASPECT = "228 / 297";

function previewMediaUrl(slot: PublicationSlotRow): string {
  const contentType = normalizeSlotContentType(slot.slot_content_type);
  if (contentType === "summary") {
    return String(slot.flatplan_summary_pdf_url ?? "").trim();
  }
  if (contentType === "index") {
    return String(slot.flatplan_index_pdf_url ?? "").trim();
  }
  const slotKey = String(slot.slot_key ?? "").trim().toLowerCase();
  if (slotKey === "cover") {
    const composite = String(slot.flatplan_cover_composite_url ?? "").trim();
    if (composite) return composite;
  }
  return String(slot.slot_media_url ?? "").trim();
}

function badgeLabelForSlot(slot: PublicationSlotRow): string {
  const contentType = normalizeSlotContentType(slot.slot_content_type);
  if (contentType === "summary") return "Sumario";
  if (contentType === "index") return "Índice de anunciantes";
  if (contentType === "article") return "Artículo";
  if (contentType === "advert") return "Publicidad";
  return String(slot.slot_content_type ?? "").trim() || "Página";
}

function ArticleChunksFallback({ slot }: { slot: PublicationSlotRow }) {
  const chunks = Array.isArray(slot.flatplan_preview_chunks)
    ? [...slot.flatplan_preview_chunks].sort(
        (a, b) => (a.chunk_position ?? 0) - (b.chunk_position ?? 0)
      )
    : [];
  if (chunks.length === 0) return null;

  return (
    <div
      className="h-full w-full overflow-auto bg-white p-3 text-left text-[11px] leading-snug text-stone-900"
      dangerouslySetInnerHTML={{
        __html: chunks.map((c) => c.chunk_html).join(""),
      }}
    />
  );
}

type FlipbookSlotPageCardProps = {
  slot: PublicationSlotRow | null;
  isLeftPage: boolean;
};

/**
 * Single magazine page from RDS flatplan data (same rendering priority as central panel preview).
 */
export function FlipbookSlotPageCard({ slot, isLeftPage }: FlipbookSlotPageCardProps) {
  const cardClass =
    "relative flex w-full flex-col overflow-hidden rounded-lg border border-stone-400/50 bg-white shadow-2xl";
  const cardStyle: React.CSSProperties = {
    aspectRatio: PAGE_ASPECT,
    width: "min(35vw, 739px)",
    minWidth: "min(90vw, 216px)",
  };

  if (!slot) {
    return (
      <div
        className={`${cardClass} items-center justify-center bg-stone-50`}
        style={cardStyle}
        aria-hidden
      >
        <span className="text-xs uppercase tracking-wider text-stone-300">En blanco</span>
      </div>
    );
  }

  const contentType = normalizeSlotContentType(slot.slot_content_type);
  const indexHtml =
    contentType === "index" && isAdvertiserIndexHtml(slot.magazine_page_layout)
      ? String(slot.magazine_page_layout)
      : "";
  const summaryHtml =
    contentType === "summary" && isArticleSummaryHtml(slot.magazine_page_layout)
      ? String(slot.magazine_page_layout)
      : "";
  const listPageHtml = indexHtml || summaryHtml;
  const mediaUrl = previewMediaUrl(slot);
  const articleFlatplanUrl = String(slot.slot_flatplan_image_url ?? "").trim();

  if (listPageHtml) {
    return (
      <div className={cardClass} style={cardStyle}>
        <div
          className="h-full w-full overflow-hidden bg-white text-left"
          dangerouslySetInnerHTML={{ __html: listPageHtml }}
        />
      </div>
    );
  }

  if (articleFlatplanUrl) {
    return (
      <div className={cardClass} style={cardStyle}>
        <div className="relative min-h-0 flex-1 bg-white">
          <FlipbookMediaThumbnail
            url={articleFlatplanUrl}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    );
  }

  if (
    contentType === "article" &&
    Array.isArray(slot.flatplan_preview_chunks) &&
    slot.flatplan_preview_chunks.length > 0
  ) {
    return (
      <div className={cardClass} style={cardStyle}>
        <ArticleChunksFallback slot={slot} />
      </div>
    );
  }

  if (mediaUrl) {
    return (
      <div className={cardClass} style={cardStyle}>
        <div className="relative min-h-0 flex-1 bg-white">
          <FlipbookMediaThumbnail
            url={mediaUrl}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${cardClass} items-stretch`} style={cardStyle}>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 bg-stone-50 px-4 py-6 text-center">
        <span className="rounded-sm border border-stone-300 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-stone-700">
          {badgeLabelForSlot(slot)}
        </span>
        <span className="text-[11px] text-stone-500">
          Sin materiales cargados todavía
        </span>
        <span className="text-[10px] text-stone-400">
          {isLeftPage ? "Página izquierda" : "Página derecha"}
        </span>
      </div>
    </div>
  );
}
