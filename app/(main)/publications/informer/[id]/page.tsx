import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InformerPhaseFlow from "../_components/InformerPhaseFlow";
import { getPublicationForPage } from "../../_lib/getPublicationForPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const pub = await getPublicationForPage(id);
  if (!pub) {
    return {
      title: "URL incorrecta · Informer",
      description: "Esta dirección de publicación no es válida.",
      robots: { index: false, follow: true },
    };
  }
  return {
    title: `${pub.revista} · Informer`,
    description: [pub["número"] ? `N.º ${pub["número"]}` : null, pub.date]
      .filter(Boolean)
      .join(" · "),
  };
}

export default async function InformerPublicationPage({ params }: PageProps) {
  const { id } = await params;
  const pub = await getPublicationForPage(id);
  if (!pub) notFound();

  const rawNum = pub["número"] ?? (pub as { numero?: unknown }).numero;
  const numero =
    rawNum != null && String(rawNum).trim() !== ""
      ? String(rawNum).trim()
      : null;
  const date =
    pub.date != null && String(pub.date).trim() !== ""
      ? String(pub.date).trim()
      : null;

  return (
    <InformerPhaseFlow
      publicationId={id}
      revista={String(pub.revista ?? "").trim() || "Publicación"}
      numero={numero}
      date={date}
      flipbookHref={`/publications/flipbook/${encodeURIComponent(id)}/0`}
    />
  );
}
