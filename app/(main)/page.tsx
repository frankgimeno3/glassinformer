"use client";

import ArticleMiniature from "./main_components/ArticleMiniature";
import articles from "@/app/contents/articlesContents.json";

export default function Home() {
  return (
    <div className="flex flex-col">
      <p>Criterio de búsqueda actual</p>
      <div className="flex flex-wrap">
        {articles.map((a, index) => (
          <ArticleMiniature
            key={index}
            id_article={a.id_article}
            contenidoTitulo={a.articleTitle}
            contenidoSubtitulo={a.articleSubtitle}
           />
        ))}
      </div>
    </div>
  );
}
