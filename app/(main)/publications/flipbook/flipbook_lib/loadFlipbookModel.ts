import { cache } from "react";
import { getPublicationForPage } from "@/app/(main)/publications/_lib/getPublicationForPage";
import { listPublicationSlotsForFlipbook } from "@/app/server/features/publication/PublicationSlotService.js";
import type { PublicationSlotRow } from "./slotTypes";
import {
  buildMagazinePreviewSpreads,
  createFlipbookSpreadModel,
  type FlipbookSpreadModel,
} from "./buildMagazinePreviewSpreads";

function normalizeSlot(raw: Record<string, unknown>): PublicationSlotRow {
  const publication_page =
    raw.publication_page != null && Number.isFinite(Number(raw.publication_page))
      ? Number(raw.publication_page)
      : 0;
  const slot_ordinal =
    raw.slot_ordinal != null && Number.isFinite(Number(raw.slot_ordinal))
      ? Number(raw.slot_ordinal)
      : publication_page + 1;
  return { ...raw, publication_page, slot_ordinal } as PublicationSlotRow;
}

export type LoadedFlipbookModel = {
  model: FlipbookSpreadModel;
  slots: PublicationSlotRow[];
};

export const loadFlipbookModelForPublicationId = cache(
  async (id: string): Promise<LoadedFlipbookModel | null> => {
    const trimmed = id?.trim();
    if (!trimmed) return null;

    const pub = await getPublicationForPage(trimmed);
    if (!pub) return null;

    const rawSlots = await listPublicationSlotsForFlipbook(trimmed);
    const slots = (Array.isArray(rawSlots) ? rawSlots : []).map((raw) =>
      normalizeSlot(raw as Record<string, unknown>)
    );
    const spreads = buildMagazinePreviewSpreads(slots);
    if (spreads.length === 0) return null;

    const title =
      String(pub.revista ?? "").trim() ||
      String((pub as { edition_name?: string }).edition_name ?? "").trim() ||
      trimmed;

    return {
      model: createFlipbookSpreadModel(spreads, title),
      slots,
    };
  }
);
