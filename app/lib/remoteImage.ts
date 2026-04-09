/** `source.unsplash.com` is deprecated and often returns 503; map to a stable asset on `images.unsplash.com`. */
const SOURCE_UNSPLASH_FALLBACK =
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80";

export function rewriteDeprecatedSourceUnsplashUrl(src: string): string {
  const raw = String(src ?? "").trim();
  if (!raw) return raw;
  try {
    const u = new URL(/^\/\//.test(raw) ? `https:${raw}` : raw);
    if (u.hostname.toLowerCase() === "source.unsplash.com") {
      return SOURCE_UNSPLASH_FALLBACK;
    }
  } catch {
    /* ignore */
  }
  return raw;
}

/**
 * Hostnames allowed for next/image optimization.
 * Keep in sync with `images.remotePatterns` in next.config.ts.
 */
const REMOTE_IMAGE_HOSTNAMES = new Set([
  "djjo025o2wqll.cloudfront.net",
  "images.unsplash.com",
  "source.unsplash.com",
  "unsplash.com",
]);

/**
 * When true, pass `unoptimized={false}` to next/image so the default optimizer runs.
 * Unknown remote hosts must stay unoptimized or Next.js throws (hostname not configured).
 */
export function canOptimizeRemoteImageSrc(src: string): boolean {
  const raw = String(src ?? "").trim();
  if (!raw) return false;
  if (raw.startsWith("data:")) return false;
  if (raw.startsWith("/")) return true;
  try {
    const u = new URL(/^\/\//.test(raw) ? `https:${raw}` : raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return REMOTE_IMAGE_HOSTNAMES.has(u.hostname);
  } catch {
    return false;
  }
}
