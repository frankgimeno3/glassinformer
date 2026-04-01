export { dynamic } from "./informer/page";

import { redirect } from "next/navigation";
import InformerPublicationsPage from "./informer/page";

type PageProps = {
  searchParams?: Promise<{ id?: string | string[] }>;
};

export default async function PublicationsPage({ searchParams }: PageProps) {
  const q = searchParams ? await searchParams : {};
  const rawId = q.id;
  const idParam = Array.isArray(rawId) ? rawId[0] : rawId;
  const id = idParam?.trim();

  if (id) {
    redirect(`/publications/informer/${encodeURIComponent(id)}`);
  }

  return <InformerPublicationsPage />;
}
