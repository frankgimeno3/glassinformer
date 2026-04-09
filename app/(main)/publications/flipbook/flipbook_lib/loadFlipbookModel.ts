import { createFlipbookModel } from "@/app/(main)/publications/flipbook/flipbook_lib/flipbook-data";
import type { FlipbookModel } from "@/app/(main)/publications/flipbook/flipbook_lib/flipbook-data";
import { getPublicationForPage } from "@/app/(main)/publications/_lib/getPublicationForPage";
import { buildFlipbookFromPublication } from "./informerToFlipbook";

export async function loadFlipbookModelForPublicationId(
  id: string
): Promise<{ model: FlipbookModel } | null> {
  const trimmed = id?.trim();
  if (!trimmed) return null;
  const pub = await getPublicationForPage(trimmed);
  if (!pub) return null;

  const rawNum = pub["número"] ?? (pub as { numero?: unknown }).numero;
  const numero =
    rawNum != null && String(rawNum).trim() !== ""
      ? String(rawNum).trim()
      : null;
  const date =
    pub.date != null && String(pub.date).trim() !== ""
      ? String(pub.date).trim()
      : null;

  const { pages, companies } = buildFlipbookFromPublication({
    publicationId: trimmed,
    revista: String(pub.revista ?? "").trim() || "Publicación",
    numero,
    date,
  });

  return { model: createFlipbookModel(pages, companies) };
}
