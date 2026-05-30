import type { PublicationSlotRow } from "./slotTypes";

export type MagazinePreviewSpread = {
  label: string;
  leftSlot: PublicationSlotRow | null;
  rightSlot: PublicationSlotRow | null;
  index: number;
  total: number;
};

const COVER_KEYS = new Set(["cover"]);
const END_KEYS = new Set(["end", "end_page", "end page"]);

function isCoverSlot(slot: PublicationSlotRow): boolean {
  return COVER_KEYS.has(String(slot.slot_key ?? "").trim().toLowerCase());
}

function isPaddingSlot(slot: PublicationSlotRow): boolean {
  return String(slot.slot_state ?? "").trim().toLowerCase() === "padding";
}

export function magazinePreviewPageLabel(slot: PublicationSlotRow): string {
  if (isCoverSlot(slot)) return "0";
  const pp = slot.publication_page;
  if (pp != null && Number.isFinite(Number(pp))) return String(Math.round(Number(pp)));
  return String(slot.publication_slot_id);
}

export function buildMagazinePreviewSpreads(
  slots: PublicationSlotRow[]
): MagazinePreviewSpread[] {
  const sorted = [...slots]
    .filter((s) => !isPaddingSlot(s))
    .sort((a, b) => {
      const ao = a.slot_ordinal;
      const bo = b.slot_ordinal;
      if (Number.isFinite(Number(ao)) && Number.isFinite(Number(bo)) && Number(ao) !== Number(bo)) {
        return Number(ao) - Number(bo);
      }
      const ap = a.publication_page;
      const bp = b.publication_page;
      if (Number.isFinite(Number(ap)) && Number.isFinite(Number(bp)) && Number(ap) !== Number(bp)) {
        return Number(ap) - Number(bp);
      }
      return a.publication_slot_id - b.publication_slot_id;
    });

  if (sorted.length === 0) return [];

  const spreads: Array<{
    leftSlot: PublicationSlotRow | null;
    rightSlot: PublicationSlotRow | null;
    label: string;
  }> = [];

  const firstIsCover = isCoverSlot(sorted[0]);
  if (firstIsCover) {
    spreads.push({ leftSlot: null, rightSlot: sorted[0], label: "0" });
  } else {
    spreads.push({
      leftSlot: null,
      rightSlot: sorted[0],
      label: magazinePreviewPageLabel(sorted[0]),
    });
  }

  const rest = sorted.slice(1);
  for (let i = 0; i < rest.length; i += 2) {
    const left = rest[i] ?? null;
    const right = rest[i + 1] ?? null;
    const labelSource = right ?? left;
    if (!labelSource) continue;
    spreads.push({
      leftSlot: left,
      rightSlot: right,
      label: magazinePreviewPageLabel(labelSource),
    });
  }

  const seenLabels = new Set<string>();
  const total = spreads.length;
  return spreads.map((spread, index) => {
    let label = spread.label;
    let suffix = 1;
    while (seenLabels.has(label)) {
      label = `${spread.label}-${suffix}`;
      suffix += 1;
    }
    seenLabels.add(label);
    return { ...spread, label, index, total };
  });
}

export function findSpreadByLabel(
  spreads: MagazinePreviewSpread[],
  label: string
): MagazinePreviewSpread | null {
  const target = String(label ?? "").trim();
  return spreads.find((s) => s.label === target) ?? null;
}

export function spreadToViewData(spread: MagazinePreviewSpread) {
  return {
    leftSlot: spread.leftSlot,
    rightSlot: spread.rightSlot,
  };
}

export type FlipbookSpreadModel = {
  spreads: MagazinePreviewSpread[];
  publicationTitle: string;
  findSpreadByLabel(label: string): MagazinePreviewSpread | null;
  getSpreadViewData(spread: MagazinePreviewSpread): {
    leftSlot: PublicationSlotRow | null;
    rightSlot: PublicationSlotRow | null;
  };
  getPrevSpread(spread: MagazinePreviewSpread): MagazinePreviewSpread | null;
  getNextSpread(spread: MagazinePreviewSpread): MagazinePreviewSpread | null;
  getPrefetchLabels(fromSpread: MagazinePreviewSpread, count?: number): string[];
};

export function createFlipbookSpreadModel(
  spreads: MagazinePreviewSpread[],
  publicationTitle: string
): FlipbookSpreadModel {
  return {
    spreads,
    publicationTitle,
    findSpreadByLabel(label: string) {
      return findSpreadByLabel(spreads, label);
    },
    getSpreadViewData(spread: MagazinePreviewSpread) {
      return spreadToViewData(spread);
    },
    getPrevSpread(spread: MagazinePreviewSpread) {
      const idx = spread.index;
      return idx > 0 ? spreads[idx - 1] : null;
    },
    getNextSpread(spread: MagazinePreviewSpread) {
      const idx = spread.index;
      return idx + 1 < spreads.length ? spreads[idx + 1] : null;
    },
    getPrefetchLabels(fromSpread: MagazinePreviewSpread, count = 6) {
      const start = fromSpread.index;
      return spreads.slice(start, start + count).map((s) => s.label);
    },
  };
}
