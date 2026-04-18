/**
 * Portal-specific configuration.
 * This is the ONLY file to modify when adapting this codebase to a different portal.
 */

export const PortalName = "Glassinformer";
export const companyDescription = "Portal for the glass industry";
export const portal_id = 1;

/**
 * `public.newsletter_user_list_id` values (UUID strings) every new profile gets at signup
 * (`user_list_subscriptions` + `users_db.newsletter_user_lists_id_array` when present).
 * Change per portal clone; leave `[]` if none.
 */
export const signupAlwaysNewsletterListIds = ["d61f1dea-b0f4-4641-a5ef-07bb58d3e655"];

/**
 * Must match the `publications.portal` value in RDS for this deploy (e.g. "GlassInformer", "BuildInformer").
 * Listings and detail only load rows where that column equals this string (case-insensitive), in addition to publication_portals / portal_id when present.
 * Leave "" only if your table has no string portal column (legacy schemas).
 */
export const publicationPortalDbValue = "GlassInformer";

const _coverBase =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_PUBLICATION_COVER_BASE_URL
    ? String(process.env.NEXT_PUBLIC_PUBLICATION_COVER_BASE_URL).replace(/\/$/, "")
    : "";

/**
 * Filled from DB column publication_main_image_url when set. If empty, built from this template when non-empty.
 * Placeholders: {id_magazine}, {id_publication}, {número}, {issue_number}, {edition_name}
 * Override in code or set NEXT_PUBLIC_PUBLICATION_COVER_BASE_URL (e.g. https://cdn.example.com/mags) → …/{id_magazine}.jpg
 */
export const publicationCoverUrlTemplate = _coverBase
  ? `${_coverBase}/{id_magazine}.jpg`
  : "";

/**
 * Mid block below article body + comments: `relatedcontent` (article cards) or `relatedproducts` (product cards; repeats to fill four slots).
 */
export const articlePageRelatedMidVariant = "relatedcontent";
