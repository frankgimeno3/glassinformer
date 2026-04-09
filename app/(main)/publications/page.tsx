import { Suspense } from "react";
import { getAllPublications } from "@/app/server/features/publication/PublicationService.js";
import PublicationsListClient from "./publications_components/list/PublicationsListClient";
import PublicationsLoadingSkeleton from "./publications_components/list/PublicationsLoadingSkeleton";
import { normalizePublicationFromApi } from "./publications_components/list/publicationListUtils";

export const dynamic = "force-dynamic";

export default async function PublicationsPage() {
  const rows = await getAllPublications();
  const list = Array.isArray(rows) ? rows : [];
  const initialPublications = list
    .map(normalizePublicationFromApi)
    .filter((p): p is NonNullable<typeof p> => p != null);

  return (
    <Suspense fallback={<PublicationsLoadingSkeleton />}>
      <PublicationsListClient initialPublications={initialPublications} />
    </Suspense>
  );
}
