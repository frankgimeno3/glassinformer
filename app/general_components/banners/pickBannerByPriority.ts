export type BannerType = "top" | "medium" | "right";

export interface BannerItem {
  id_banner: string;
  bannerType: BannerType;
  bannerSrc: string;
  bannerRoute: string;
  /** External URL for the banner click (e.g. https://www.vidrioperfil.com/es-es/) */
  bannerRedirection: string;
  bannerPriority: number;
  /** Optional: white/light logo centered on the dark panel (PNG/SVG). */
  sponsorLogoSrc?: string;
  /** Optional: small logo top-right on the photo area. */
  cornerLogoSrc?: string;
}

/**
 * Clear preference high > medium > low. Weight = 1.4^priority (low=1, medium=1.4, high≈1.96).
 * High is ~2x more likely than low so priority is noticeable.
 */
const PRIORITY_WEIGHT_FACTOR = 1.4;

/** Shuffle array (Fisher–Yates). Exported for multi-banner slots. */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function weight(b: BannerItem): number {
  return Math.pow(PRIORITY_WEIGHT_FACTOR, b.bannerPriority);
}

function normalizeRoute(route: string | null | undefined): string {
  const raw = (route ?? "").trim();
  if (!raw || raw === "/") return "/";
  const withoutQuery = raw.split(/[?#]/, 1)[0] ?? raw;
  const withLeadingSlash = withoutQuery.startsWith("/")
    ? withoutQuery
    : `/${withoutQuery}`;
  return withLeadingSlash.replace(/\/+$/, "") || "/";
}

function matchesBannerRoute(
  bannerRoute: string | null | undefined,
  currentRoute: string | null | undefined
): boolean {
  const normalizedBannerRoute = normalizeRoute(bannerRoute);
  if (normalizedBannerRoute === "/") {
    return normalizeRoute(bannerRoute) === "/" || !(bannerRoute ?? "").trim();
  }
  return normalizedBannerRoute === normalizeRoute(currentRoute);
}

function filterBanners(
  banners: BannerItem[],
  bannerType: BannerType,
  currentRoute?: string
): BannerItem[] {
  return banners.filter(
    (b) => b.bannerType === bannerType && matchesBannerRoute(b.bannerRoute, currentRoute)
  );
}

/**
 * Picks one banner with weighted random: high > medium > low (noticeable difference).
 * Priority from DB appearance_weight (high→2, medium→1, low→0).
 */
export function pickBannerByPriority(
  banners: BannerItem[],
  bannerType: BannerType,
  currentRoute?: string
): BannerItem | null {
  const filtered = shuffle(filterBanners(banners, bannerType, currentRoute));
  if (filtered.length === 0) return null;
  if (filtered.length === 1) return filtered[0];

  const weights = filtered.map((b) => weight(b));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;

  for (let i = 0; i < filtered.length; i++) {
    r -= weights[i];
    if (r <= 0) return filtered[i];
  }
  return filtered[filtered.length - 1];
}

/**
 * Picks up to N banners by weighted random without replacement.
 * High-priority banners are more likely to be chosen and to appear first. Good for right column.
 */
export function pickNBannersByPriority(
  banners: BannerItem[],
  bannerType: BannerType,
  n: number,
  currentRoute?: string
): BannerItem[] {
  const pool = [...filterBanners(banners, bannerType, currentRoute)];
  if (pool.length === 0) return [];
  const count = Math.min(n, pool.length);
  const result: BannerItem[] = [];

  for (let k = 0; k < count; k++) {
    const weights = pool.map((b) => weight(b));
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        idx = i;
        break;
      }
      idx = i;
    }
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}
