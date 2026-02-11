import React, { FC } from "react";
import Image from "next/image";
import Link from "next/link";

function companyToId(company: string | undefined): string {
  if (!company) return "";
  return encodeURIComponent(company.toLowerCase().replace(/\s+/g, "-"));
}

interface ArticleItem {
  id_article: string;
  articleTitle: string;
  articleSubtitle?: string;
  company?: string;
  date?: string;
  article_main_image_url?: string;
  article_tags_array?: string[];
}

interface MainNewsProps {
  mainArticle: ArticleItem | null;
  secondaryArticles: ArticleItem[];
}

const MainNews: FC<MainNewsProps> = ({ mainArticle, secondaryArticles }) => {
  const hasMain = mainArticle && mainArticle.id_article && mainArticle.articleTitle;
  const hasSecondary = secondaryArticles.length > 0;
  if (!hasMain && !hasSecondary) return null;

  return (
    <div className="flex flex-row justify-between gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Main featured article */}
      {hasMain && (
        <div className="flex flex-col flex-[2]">
          <article className="group flex flex-col bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 overflow-hidden">
            <Link
              href={`/articles/${mainArticle!.id_article}`}
              className="relative w-full aspect-[16/9] min-h-[280px] overflow-hidden bg-gray-100 block"
            >
              <Image
                src={mainArticle!.article_main_image_url || "/file.svg"}
                alt={mainArticle!.articleTitle}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 768px) 100vw, 66vw"
                unoptimized
              />
            </Link>
            <div className="flex flex-col p-6 md:p-8 space-y-4">
              {(mainArticle!.article_tags_array?.length ?? 0) > 0 && (
                <span className="text-xs font-sans uppercase tracking-wider text-blue-600 font-medium">
                  {mainArticle!.article_tags_array![0]}
                </span>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-500 uppercase tracking-wider font-sans">
                {mainArticle!.company && (
                  <>
                    <Link
                      href={`/directory/companies/${companyToId(mainArticle!.company)}`}
                      className="font-medium hover:text-blue-600 transition-colors"
                    >
                      {mainArticle!.company}
                    </Link>
                    <span className="text-gray-300">•</span>
                  </>
                )}
                <time>{mainArticle!.date ?? ""}</time>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight group-hover:text-gray-700 transition-colors line-clamp-3">
                <Link href={`/articles/${mainArticle!.id_article}`}>
                  {mainArticle!.articleTitle}
                </Link>
              </h1>
              {mainArticle!.articleSubtitle && (
                <p className="text-base text-gray-600 font-sans leading-relaxed line-clamp-2">
                  {mainArticle!.articleSubtitle}
                </p>
              )}
              <div className="pt-4 border-t border-gray-100">
                <Link
                  href={`/articles/${mainArticle!.id_article}`}
                  className="text-xs text-gray-400 font-sans uppercase tracking-wider group-hover:text-gray-600 transition-colors inline-block"
                >
                  Read more →
                </Link>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* Secondary articles as cards (Position1..Position5) */}
      {hasSecondary && (
        <div className="flex flex-col flex-1 gap-4">
          {secondaryArticles.map((article) => (
            <article
              key={article.id_article}
              className="group flex flex-row gap-4 p-4 bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300"
            >
              <Link
                href={`/articles/${article.id_article}`}
                className="relative shrink-0 w-24 h-24 md:w-28 md:h-28 overflow-hidden bg-gray-100"
              >
                <Image
                  src={article.article_main_image_url || "/file.svg"}
                  alt={article.articleTitle}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="112px"
                  unoptimized
                />
              </Link>
              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-sans mb-1">
                  {article.company && (
                    <>
                      <Link
                        href={`/directory/companies/${companyToId(article.company)}`}
                        className="font-medium hover:text-blue-600 transition-colors truncate"
                      >
                        {article.company}
                      </Link>
                      <span className="text-gray-300 shrink-0">•</span>
                    </>
                  )}
                  <time className="shrink-0">{article.date ?? ""}</time>
                </div>
                <h2 className="font-serif text-sm md:text-base font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-gray-700">
                  <Link href={`/articles/${article.id_article}`}>
                    {article.articleTitle}
                  </Link>
                </h2>
                {article.articleSubtitle && (
                  <p className="text-xs text-gray-600 font-sans line-clamp-2 mt-0.5">
                    {article.articleSubtitle}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default MainNews;