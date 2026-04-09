/**
 * Normalizes API / RDS-shaped publication rows for the publications list UI.
 * Accepts both camelCase (PublicationService map) and snake_case.
 */

export function formatPublicationDate(isoDate: string): string {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export interface Publication {
  id?: string;
  number: number;
  title: string;
  description: string;
  redirection_link: string;
  year: number;
  publicationDate: string;
  publicationMainImageUrl?: string;
}

function readString(v: unknown): string {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

export function normalizePublicationFromApi(raw: unknown): Publication | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const numRaw = r.number ?? r.number_publication ?? r["número"];
  const numValue =
    numRaw !== undefined && numRaw !== null ? Number(numRaw) : NaN;

  const publicationDate = readString(
    r.date ?? r.publicationDate ?? r.publication_date
  );
  const redirection = readString(r.redirection_link ?? r.redirectionLink);
  const id = readString(r.id_publication) || undefined;
  const title = readString(r.revista ?? r.title);

  if (!id && !publicationDate && !redirection && !title) return null;

  let year = 0;
  if (publicationDate) {
    const d = new Date(publicationDate);
    if (!Number.isNaN(d.getTime())) year = d.getFullYear();
  }

  return {
    id,
    number: Number.isNaN(numValue) ? 0 : numValue,
    title: title || "Publication",
    description: readString(r.description),
    redirection_link: redirection,
    year,
    publicationDate,
    publicationMainImageUrl: readString(r.publication_main_image_url),
  };
}
