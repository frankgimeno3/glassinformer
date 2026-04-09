import type {
  ArticleContentBlock,
  ArticleTextFlow,
} from "../flipbook_types/flipbook";

const IMG = {
  glass: "https://images.unsplash.com/photo-1513475382583-d06e58bcb0e0?w=800&q=80",
  factory: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&q=80",
  team: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
  bottle: "https://images.unsplash.com/photo-1615811641619-633e4f3774d7?w=800&q=80",
  jar: "https://images.unsplash.com/photo-1608571423902-eed4a5a810eb?w=800&q=80",
  green: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
  office: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
  warehouse:
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
  lab: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
  conveyor:
    "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&q=80",
} as const;

/** Contenidos mock por `page_id` de slide editorial / noticia. */
const bySlideId: Record<string, ArticleContentBlock[]> = {
  "ed-1": [
    {
      kind: "onlytext",
      text: "Bienvenida a este número de Glass Informer. Cada tarjeta resume una pieza de contenido: puedes avanzar y retroceder con las flechas del lector o del teclado, y profundizar cuando lo necesites sin perder el hilo del número.",
      textFlow: "block",
    },
    {
      kind: "imagetext",
      src: IMG.factory,
      text: "La experiencia está pensada para móvil y escritorio: lectura rápida primero, profundidad bajo demanda. Así encaja en pausas cortas y en revisiones más largas del despacho o la planta.",
    },
    {
      kind: "onlytext",
      text: "Al final de las ampliaciones encontrarás, cuando existan, enlaces a perfiles de empresa y producto y al artículo completo en la web. No sustituyen al PDF ni al archivo histórico, pero sí acortan el camino hacia la fuente.",
      textFlow: "newspaper",
    },
    {
      kind: "textimage",
      text: "El vidrio sigue siendo el material de referencia cuando la marca busca premium, transparencia literal y reciclabilidad creíble para el consumidor. La cadena de valor completa —desde el horno hasta el punto verde— está en el centro del debate de este trimestre.",
      src: IMG.glass,
    },
    {
      kind: "onlyimage",
      src: IMG.warehouse,
    },
    {
      kind: "onlytext",
      text: "En las páginas siguientes encontrarás el temario ampliado, los datos del número y una selección de notas alineadas con los bloques temáticos que ya conoces del Informer interactivo. Gracias por leernos.",
      textFlow: "newspaper",
    },
  ],
  "ed-2": [
    {
      kind: "onlytext",
      text: "Cómo leer este flipbook: piensa en tres capas. Primero eliges temas; luego recorres el editorial; por último solo ves las noticias que marcaste. El orden no es casual: reduce ruido y respeta el tiempo del lector.",
      textFlow: "block",
    },
    {
      kind: "textimage",
      text: "En la segunda fase marcas qué bloques te interesan —mercado, producto, sostenibilidad, empresa— y el sistema guarda esa preferencia para el resto del flujo. Después lees el editorial completo y, al cerrar, accedes únicamente a las piezas de tus temas.",
      src: IMG.team,
    },
    {
      kind: "imagetext",
      src: IMG.factory,
      text: "Las flechas laterales cambian de noticia dentro de la misma categoría; la acción inferior despliega texto ampliado y enlaces sin sacarte del modo lectura. Evitas scroll infinito y mantienes contexto visual de la pieza que estás revisando.",
    },
    {
      kind: "onlyimage",
      src: IMG.conveyor,
    },
    {
      kind: "onlytext",
      text: "Si algo no cuadra con tu operación diaria —logística, calidad, compras o marketing— utiliza el informe como mapa y vuelve al artículo largo solo donde haga falta. Ese es el contrato editorial de este formato: brevedad por defecto, detalle bajo petición.",
      textFlow: "newspaper",
    },
    {
      kind: "textimage",
      text: "Las métricas de uso nos dicen que la mayoría completa el recorrido en menos de ocho minutos la primera vez, y vuelve después a notas concretas. Construimos el flipbook pensando en esa segunda visita.",
      src: IMG.lab,
    },
  ],
  "n-1": [
    {
      kind: "imagetext",
      src: IMG.bottle,
      text: "Los datos del último trimestre sitúan al vidrio retornable como opción preferida en un 34% de los hogares encuestados en cuatro países europeos. El crecimiento es más acusado en categorías premium de bebidas y en formatos con storytelling de origen local.",
    },
    {
      kind: "onlytext",
      text: "Las marcas apuestan por envases más ligeros sin renunciar a la sensación de peso “noble” en mano, y por diseños diferenciales en cuello y acabado que funcionen tanto en estantería como en foto de redes. El canal horeca refuerza la tendencia con acuerdos de depósito y lavado centralizado.",
      textFlow: "newspaper",
    },
    {
      kind: "textimage",
      text: "Los retos siguen siendo coste logístico del retorno, trazabilidad del lote y armonización fiscal entre fronteras. Los grupos que ya integran RFID en palet y retornable reportan menos mermas declaradas y reconciliación más rápida con distribuidores.",
      src: IMG.warehouse,
    },
    {
      kind: "onlytext",
      text: "Para Q3 esperamos nuevos datos de penetración en grandes superficies y una comparativa con otros materiales en bebidas carbonatadas. Mientras tanto, las plantas de lavado amplían capacidad en corredores donde la normativa de envases reutilizables aprieta plazos.",
      textFlow: "half",
    },
    {
      kind: "onlytext",
      text: "Desde Glass Informer seguiremos publicando cifras verificables y entrevistas breves a responsables de cadena. Si tu empresa tiene un caso piloto en marcha, el boletín de la web abre convocatoria de notas cada mes.",
      textFlow: "half",
    },
    {
      kind: "onlyimage",
      src: IMG.glass,
    },
  ],
  "n-2": [
    {
      kind: "onlytext",
      text: "La serie UL-30 reduce un 18% el peso unitario respecto a la generación anterior gracias a geometría de pared optimizada, radio de hombro revisado y ajuste fino del proceso de soplado. Los ensayos de caída y apilado mantienen márgenes similares a los del estándar que reemplaza.",
      textFlow: "newspaper",
    },
    {
      kind: "imagetext",
      src: IMG.jar,
      text: "Se ofrece en tres capacidades estándar —30, 50 y 100 ml— y acabados mate o brillo con posibilidad de serigrafía de alta definición. Las líneas de cosmética y nutricosmética fueron las primeras en solicitar muestras; tres marcas arrancan campaña piloto en Q2 con stock limitado.",
    },
    {
      kind: "onlytext",
      text: "El departamento técnico insiste en que la reducción de peso no es solo ahorro de vidrio: implica menos energía en transporte, menos carga en líneas de llenado y menor impacto percibido en mano para frascos que deben viajar en neceser.",
      textFlow: "block",
    },
    {
      kind: "textimage",
      text: "Los clientes industriales piden documentación de migración clara: curvas de llenado, compatibilidad con tapas existentes y ventana de coexistencia en línea. El fabricante publicará fichas revisadas antes del lanzamiento comercial general.",
      src: IMG.lab,
    },
    {
      kind: "onlyimage",
      src: IMG.factory,
    },
  ],
  "n-3": [
    {
      kind: "textimage",
      text: "El borrador de metodología unificada para huella de carbono en envase de vidrio delimita fronteras del sistema, factores de emisión por región y reglas mínimas de reporting B2B. La consulta pública —abierta ocho semanas— incluye anexos con ejemplos numéricos anonimizados.",
      src: IMG.green,
    },
    {
      kind: "imagetext",
      src: IMG.conveyor,
      text: "Asociaciones nacionales y el grupo de trabajo paneuropeo buscan que el marco sea lo suficientemente estricto para comparabilidad, pero flexible para pymes que aún digitalizan consumos de gas y electricidad en hornos y enfriadores.",
    },
    {
      kind: "onlytext",
      text: "Las empresas medianas podrán adherirse a un kit de implementación escalonado: plantillas Excel, checklist de datos obligatorios y un módulo de preguntas frecuentes redactado con auditorías ya realizadas en 2025.",
      textFlow: "newspaper",
    },
    {
      kind: "onlytext",
      text: "Quienes publiquen cifras antes de la fecha límite podrán usar una etiqueta provisional de “en alineación” en fichas comerciales, sujeta a revisión externa en muestra aleatoria. El comité técnico publicará la primera lista de verificadores acreditados en el anexo 3.",
      textFlow: "half",
    },
    {
      kind: "onlytext",
      text: "Desde el observatorio de normativa avisamos: cualquier cifra antigua mezclada con la nueva metodología sin nota metodológica será considerada misleading en el código de buenas prácticas que votamos en asamblea.",
      textFlow: "half",
    },
  ],
  "n-4": [
    {
      kind: "onlyimage",
      src: IMG.office,
    },
    {
      kind: "onlytext",
      text: "Tres plantas piloto han incorporado itinerarios de 24 meses con bloques técnicos, seguridad y digitalización de puesto. Cada cohorte incluye mentor asignado, evaluación trimestral y rotación corta en mantenimiento para ver el impacto real del trabajo en cadena.",
      textFlow: "half",
    },
    {
      kind: "onlytext",
      text: "La satisfacción interna subió 12 puntos en la última encuesta; la retención a 18 meses mejoró en dos de las tres sedes. El modelo se extiende a otras ubicaciones a final de año con calendario escalonado para no saturar formadores internos.",
      textFlow: "half",
    },
    {
      kind: "imagetext",
      src: IMG.team,
      text: "RR.HH. destaca que los jóvenes valoran certificaciones internas reconocidas fuera de la empresa y que el componente de seguridad —historias reales, no solo normas— fue el mejor puntuado del programa en retroalimentación anónima.",
    },
    {
      kind: "onlytext",
      text: "Las plantas que aún no entran en la ola 2 pueden adelantar diagnóstico de brechas con la autoevaluación publicada en la intranet del grupo. El comité de personas fijará cupos trimestrales según capacidad de tutores.",
      textFlow: "newspaper",
    },
    {
      kind: "textimage",
      text: "El sindicato ha pedido que las horas de formación cuenten como tiempo de trabajo efectivo y que exista equivalencia con módulos oficiales donde la ley lo permita. La mesa negociadora se reúne la próxima semana con una propuesta conjunta sobre baremación.",
      src: IMG.office,
    },
    {
      kind: "onlyimage",
      src: IMG.factory,
    },
  ],
};

export function getMockArticleContentsForSlideId(
  slideId: string
): ArticleContentBlock[] | undefined {
  return bySlideId[slideId];
}

/** Convierte párrafos planos en bloques onlytext (temario, datos, etc.). */
export function onlyTextBlocks(
  texts: string[],
  textFlow: ArticleTextFlow = "block"
): ArticleContentBlock[] {
  return texts.map((text) => ({ kind: "onlytext" as const, text, textFlow }));
}
