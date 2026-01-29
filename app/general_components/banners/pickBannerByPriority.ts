export type BannerType = "top" | "medium" | "right";

export interface BannerItem {
  id_banner: string;
  bannerType: BannerType;
  bannerSrc: string;
  bannerRoute: string;
  /** External URL for the banner click (e.g. https://www.vidrioperfil.com/es-es/) */
  bannerRedirection: string;
  bannerPriority: number;
}

/**
 * Weight for priority n = (1.1)^n.
 * Returns one banner from the filtered list, chosen by weighted random.
 */
export function pickBannerByPriority(
  banners: BannerItem[],
  bannerType: BannerType
): BannerItem | null {
  const filtered = banners.filter((b) => b.bannerType === bannerType);
  if (filtered.length === 0) return null;
  if (filtered.length === 1) return filtered[0];

  const weights = filtered.map((b) => Math.pow(1.1, b.bannerPriority));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;

  for (let i = 0; i < filtered.length; i++) {
    r -= weights[i];
    if (r <= 0) return filtered[i];
  }
  return filtered[filtered.length - 1];
}
