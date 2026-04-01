export type PageType =
  | "cover"
  | "article"
  | "advert"
  | "advertiserIndex"
  | "Summary"
  | "backCover";
export type PageSide = "cover" | "end" | "left" | "right";

/** Un bloque del cuerpo del artículo (cada uno es un “párrafo” lógico). */
export type ArticleContentKind =
  | "onlyimage"
  | "onlytext"
  | "textimage"
  | "imagetext";

export type ArticleTextFlow = "newspaper" | "block" | "half";

export interface ArticleContentBlock {
  kind: ArticleContentKind;
  /** URL de imagen cuando aplica. */
  src?: string;
  /** Texto tal cual cuando aplica. */
  text?: string;
  /**
   * Solo `onlytext`:
   * - `newspaper` (defecto): fila completa, texto repartido en 2 columnas.
   * - `block`: un solo bloque a ancho completo (sin reparto en columnas).
   * - `half`: media página; emparejar dos bloques `half` en la misma fila.
   */
  textFlow?: ArticleTextFlow;
}

export interface FlipbookPage {
  page_id: string;
  page_number: number;
  page_type: PageType;
  page_side: PageSide;
  relatedTo?: string;
  titulo?: string;
  subtitulo?: string;
  /** Si existe, sustituye a la imagen derivada de Unsplash por `page_id`. */
  imageUrl?: string;
  /** Imagen principal bajo cabecera (artículos). */
  mainImage?: string;
  /** Cuerpo del artículo por bloques (onlyimage | onlytext | textimage | imagetext). */
  articleContents?: ArticleContentBlock[];
  /** Texto mostrado en columnas (mismo rol que el lorem cuando no hay mock). */
  bodyParagraphs?: string[];
  /** Sustituye la etiqueta de tipo (p. ej. tema del Informer). */
  sectionLabel?: string;
  coverTagline?: string;
  coverRevista?: string;
  /** Portada: entradas del temario, sobrepuestas a la izquierda. */
  coverTemarioLines?: string[];
  /** Portada: líneas de “Datos del número” (año, nº, fecha, etc.). */
  coverIssueLines?: string[];
  /** Portada: línea temática bajo el título “Datos del número”. */
  coverIssueThematic?: string;
}

export interface Company {
  company_id: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_web: string;
}
