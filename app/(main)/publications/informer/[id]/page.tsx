import type { Metadata } from "next";
import PublicationViewer from "../../_components/PublicationViewer";
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
  return <PublicationViewer id={id} variant="informer" />;
}
