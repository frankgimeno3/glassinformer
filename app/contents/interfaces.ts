export interface articleInterface {
    id_article: string,
    articleTitle: string,
    articleSubtitle: string,
    article_main_image_url: string,
    article_tags_array: string[],
    contents_array: string[]
}

export interface articleMiniatureInterface {
    contenidoTitulo: string,
    contenidoSubtitulo: string,
    url_imagen: string
}