import { redirect } from "next/navigation";

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
  redirect("/publications/informer");
}
