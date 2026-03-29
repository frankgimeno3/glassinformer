import { getAllPublications } from "@/app/server/features/publication/PublicationService.js";
import PublicationsInformerListClient from "../publicationComponents/PublicationsInformerListClient";
import { normalizePublicationFromApi } from "../publicationComponents/publicationListUtils";

export const dynamic = "force-dynamic";

export default async function InformerPublicationsPage() {
  const rows = await getAllPublications();
  const list = Array.isArray(rows) ? rows : [];
  const initialPublications = list
    .map(normalizePublicationFromApi)
    .filter((p): p is NonNullable<typeof p> => p != null);

  return (
    <PublicationsInformerListClient initialPublications={initialPublications} />
  );
}
