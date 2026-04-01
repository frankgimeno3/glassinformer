import type {
  Company,
  FlipbookPage,
} from "@/app/(flipbook)/publications/flipbook/_types/flipbook";
import {
  mockInformerArticleSlides,
  mockInformerEditorialSlides,
  mockInformerPublicationMeta,
  mockInformerTopics,
} from "@/app/(main)/publications/informer/_lib/mockInformerData";
import {
  getMockArticleContentsForSlideId,
  onlyTextBlocks,
} from "@/app/(flipbook)/publications/flipbook/_lib/mockArticleContents";

const PREF_AD_IMAGES = [
  "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1200&q=80",
  "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1200&q=80",
] as const;

function lrSide(pageNumber: number): "left" | "right" {
  return pageNumber % 2 === 1 ? "left" : "right";
}

/**
 * Misma base de contenido que el Informer: metadatos mock + slides editoriales y notas.
 * La portada usa revista / número / fecha de la publicación en BD.
 */
export function buildFlipbookFromPublication(params: {
  publicationId: string;
  revista: string;
  numero: string | null;
  date: string | null;
}): { pages: FlipbookPage[]; companies: Company[] } {
  const meta = mockInformerPublicationMeta;
  const pages: FlipbookPage[] = [];
  let p = 0;

  pages.push({
    page_id: `cov_${params.publicationId}`,
    page_number: p++,
    page_type: "cover",
    page_side: "cover",
    imageUrl: meta.coverImageUrl,
    coverRevista: params.revista,
    coverTagline: meta.tagline,
    coverTemarioLines: mockInformerTopics.map((t) => `· ${t.label} — ${t.hint}`),
    coverIssueThematic: meta.thematic,
    coverIssueLines: [
      `Año: ${meta.year}`,
      ...(params.numero ? [`Número: ${params.numero}`] : []),
      ...(params.date ? [`Fecha: ${params.date}`] : []),
      meta.tagline,
    ],
  });

  pages.push({
    page_id: `pref_ad_1_${params.publicationId}`,
    page_number: p++,
    page_type: "advert",
    page_side: lrSide(1),
    titulo: "Anuncio preferente 1",
    subtitulo: "Espacio reservado para patrocinador destacado",
    imageUrl: PREF_AD_IMAGES[0],
    sectionLabel: "Anuncio preferente",
    bodyParagraphs: [
      "Ubicación premium tras portada. Contacte con comercial para reservas en próximos números.",
    ],
  });

  pages.push({
    page_id: `pref_ad_2_${params.publicationId}`,
    page_number: p++,
    page_type: "advert",
    page_side: lrSide(2),
    titulo: "Anuncio preferente 2",
    subtitulo: "Segundo hueco preferente del número",
    imageUrl: PREF_AD_IMAGES[1],
    sectionLabel: "Anuncio preferente",
    bodyParagraphs: [
      "Misma categoría de visibilidad que la página anterior. Formatos a medida bajo brief.",
    ],
  });

  for (const slide of mockInformerEditorialSlides) {
    const num = p++;
    const blocks =
      getMockArticleContentsForSlideId(slide.id) ??
      onlyTextBlocks([slide.summaryExpanded]);
    pages.push({
      page_id: slide.id,
      page_number: num,
      page_type: "article",
      page_side: lrSide(num),
      titulo: slide.title,
      subtitulo: slide.summaryShort,
      mainImage: slide.imageUrl,
      articleContents: blocks,
      sectionLabel: "Editorial",
    });
  }

  {
    const numL = p++;
    pages.push({
      page_id: `sum_l_${params.publicationId}`,
      page_number: numL,
      page_type: "Summary",
      page_side: lrSide(numL),
    });
    const numR = p++;
    pages.push({
      page_id: `sum_r_${params.publicationId}`,
      page_number: numR,
      page_type: "article",
      page_side: lrSide(numR),
      titulo: "Guía de lectura",
      subtitulo: "Mismo contenido que en el Informer",
      mainImage:
        mockInformerArticleSlides[0]?.imageUrl ?? meta.coverImageUrl,
      articleContents: onlyTextBlocks([
        "A la izquierda, el índice de piezas de este número (editorial y notas).",
        "Las páginas siguientes reproducen cada tarjeta del Informer: título, resumen, texto ampliado e imagen.",
      ]),
      sectionLabel: "Sumario",
    });
  }

  for (const slide of mockInformerArticleSlides) {
    const topicLabel =
      mockInformerTopics.find((t) => t.id === slide.topicId)?.label ??
      "Tu selección";
    const num = p++;
    const blocks =
      getMockArticleContentsForSlideId(slide.id) ??
      onlyTextBlocks([slide.summaryShort, slide.summaryExpanded]);
    pages.push({
      page_id: slide.id,
      page_number: num,
      page_type: "article",
      page_side: lrSide(num),
      titulo: slide.title,
      subtitulo: slide.summaryShort,
      mainImage: slide.imageUrl,
      articleContents: blocks,
      sectionLabel: topicLabel,
    });
  }

  pages.push({
    page_id: `back_${params.publicationId}`,
    page_number: p++,
    page_type: "backCover",
    page_side: "end",
    imageUrl: meta.coverImageUrl,
    titulo: params.revista,
    bodyParagraphs: [
      meta.tagline,
      "© Revista Glass Informer. Todos los derechos reservados.",
    ],
  });

  return { pages, companies: [] };
}
