import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ fs?: string }>;
};

export default async function FlipbookPublicationRedirect({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const q = sp.fs === "1" ? "?fs=1" : "";
  redirect(`/publications/flipbook/${encodeURIComponent(id)}/0${q}`);
}
