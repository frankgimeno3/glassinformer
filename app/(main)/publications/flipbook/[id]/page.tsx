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
      title: "URL incorrecta · Flipbook",
      description: "Esta dirección de publicación no es válida.",
      robots: { index: false, follow: true },
    };
  }
  return {
    title: `${pub.revista} · Flipbook`,
    description: [pub["número"] ? `N.º ${pub["número"]}` : null, pub.date]
      .filter(Boolean)
      .join(" · "),
  };
}

export default async function FlipbookPublicationPage({ params }: PageProps) {
  const { id } = await params;
  return <PublicationViewer id={id} variant="flipbook" />;
}
