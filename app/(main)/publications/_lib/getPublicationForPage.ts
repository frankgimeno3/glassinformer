import { cache } from "react";
import { getPublicationById } from "@/app/server/features/publication/PublicationService.js";

export type PublicationPageRow = Awaited<ReturnType<typeof getPublicationById>>;

export const getPublicationForPage = cache(async (idPublication: string) => {
  if (!idPublication?.trim()) return null;
  try {
    return await getPublicationById(idPublication.trim());
  } catch {
    return null;
  }
});

export function embedSrcFromRedirectionLink(redirectionLink: string): string | null {
  const raw = (redirectionLink ?? "").trim();
  if (!raw) return null;
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}
