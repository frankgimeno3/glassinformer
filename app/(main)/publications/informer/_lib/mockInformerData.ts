export type InformerPublicationMeta = {
  year: number;
  thematic: string;
  tagline: string;
  coverImageUrl: string;
};

export type InformerTopic = {
  id: string;
  label: string;
  hint: string;
};

export type InformerSlideLinks = {
  productProfile?: string;
  companyProfile?: string;
  fullArticle?: string;
};

export type InformerSlide = {
  id: string;
  title: string;
  summaryShort: string;
  summaryExpanded: string;
  imageUrl: string;
  links?: InformerSlideLinks;
  /** Solo noticias por tema; el editorial no lleva topicId */
  topicId?: string;
};

export const mockInformerPublicationMeta: InformerPublicationMeta = {
  year: 2026,
  thematic: "Innovación en envase vidrio y sostenibilidad",
  tagline: "Tendencias, productos y mercado en un solo vistazo.",
  coverImageUrl:
    "https://images.unsplash.com/photo-1513475382583-d06e58bcb0e0?w=800&q=80",
};

export const mockInformerTopics: InformerTopic[] = [
  {
    id: "mercado",
    label: "Mercado y tendencias",
    hint: "Datos de consumo y previsiones del sector.",
  },
  {
    id: "producto",
    label: "Novedades de producto",
    hint: "Lanzamientos y reformulaciones destacadas.",
  },
  {
    id: "sostenibilidad",
    label: "Sostenibilidad y circularidad",
    hint: "Normativa, reciclaje y huella.",
  },
  {
    id: "empresa",
    label: "Empresa y personas",
    hint: "Equipos, alianzas y cultura.",
  },
];

/** Contenido editorial obligatorio (fase 3) */
export const mockInformerEditorialSlides: InformerSlide[] = [
  {
    id: "ed-1",
    title: "Bienvenida al número",
    summaryShort:
      "Este informer recorre lo esencial del sector en formato breve y visual.",
    summaryExpanded:
      "Cada tarjeta resume una pieza de contenido. Puedes avanzar y retroceder con las flechas, y usar la flecha hacia abajo para ampliar el texto sin salir del flujo. Al final de la ampliación encontrarás enlaces a perfiles y al artículo completo cuando existan. Es una experiencia pensada para móvil: lectura rápida primero, profundidad bajo demanda.",
    imageUrl:
      "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&q=80",
    links: {
      companyProfile: "https://example.com/empresa/editorial",
    },
  },
  {
    id: "ed-2",
    title: "Cómo usar este informer",
    summaryShort:
      "Funciona como un “Tinder” de noticias: eliges temas, luego pasas tarjetas.",
    summaryExpanded:
      "En la segunda fase marcas qué bloques te interesan. Después lees el editorial completo y, por último, solo las noticias de tus temas. Las flechas laterales cambian de noticia; la flecha inferior despliega más texto y enlaces. Así evitas scroll infinito y te centras en lo que elegiste.",
    imageUrl:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
    links: {
      fullArticle: "https://example.com/ayuda/informer",
    },
  },
];

/** Noticias por tema (fase 4) */
export const mockInformerArticleSlides: InformerSlide[] = [
  {
    id: "n-1",
    topicId: "mercado",
    title: "Repunte en envases retornables",
    summaryShort:
      "Los mercados europeos muestran mayor aceptación del vidrio reutilizable en categorías premium.",
    summaryExpanded:
      "Los datos del último trimestre sitúan al vidrio retornable como opción preferida en un 34% de los hogares encuestados en cuatro países. Las marcas apuestan por formatos más ligeros y diseños diferenciales. El canal horeca refuerza la tendencia con acuerdos de depósito.",
    imageUrl:
      "https://images.unsplash.com/photo-1615811641619-633e4f3774d7?w=800&q=80",
    links: {
      productProfile: "https://example.com/producto/retornable-premium",
      companyProfile: "https://example.com/empresa/vidriera-norte",
      fullArticle: "https://example.com/articulo/retornables-2026",
    },
  },
  {
    id: "n-2",
    topicId: "producto",
    title: "Nueva línea de frascos ultraligeros",
    summaryShort:
      "Reducción de peso sin sacrificar resistencia mecánica ni estética en estantería.",
    summaryExpanded:
      "La serie UL-30 reduce un 18% el peso unitario gracias a geometría optimizada y proceso de soplado ajustado. Se ofrece en tres capacidades estándar y acabados mate o brillo. Campañas piloto con tres marcas de cosmética arrancan en Q2.",
    imageUrl:
      "https://images.unsplash.com/photo-1608571423902-eed4a5a810eb?w=800&q=80",
    links: {
      productProfile: "https://example.com/producto/ul-30",
      fullArticle: "https://example.com/articulo/ul-30-lanzamiento",
    },
  },
  {
    id: "n-3",
    topicId: "sostenibilidad",
    title: "Huella de carbono: metodología unificada",
    summaryShort:
      "Sector y asociaciones trabajan en un marco común de medición y comunicación.",
    summaryExpanded:
      "El borrador incluye límites del sistema, factores de emisión regionales y reglas de reporting para B2B. La consulta pública cierra en ocho semanas. Las empresas medianas podrán adherirse a un kit de implementación escalonado.",
    imageUrl:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
    links: {
      companyProfile: "https://example.com/empresa/consejo-vidrio",
    },
  },
  {
    id: "n-4",
    topicId: "empresa",
    title: "Plan de talento joven en planta",
    summaryShort:
      "Rotaciones, mentoría digital y certificaciones internas como eje de retención.",
    summaryExpanded:
      "Tres plantas piloto han incorporado itinerarios de 24 meses con bloques técnicos y de seguridad. La satisfacción interna subió 12 puntos en la última encuesta. El modelo se extiende a otras ubicaciones a final de año.",
    imageUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    links: {
      companyProfile: "https://example.com/empresa/recursos-humanos",
      fullArticle: "https://example.com/articulo/talento-joven-vidrio",
    },
  },
];
