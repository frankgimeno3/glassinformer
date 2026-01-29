import React, { FC } from "react";
import Image from "next/image";
import Link from "next/link";

interface MainNewsProps {}

const mainArticleMock = {
  id_article: "main-1",
  titulo: "Industry Leaders Gather at Glass Summit 2025 to Shape Future of Sustainable Manufacturing",
  topic: "Sustainability",
  company: "GlassTech International",
  id_company: "glasstech-international",
  date: "January 28, 2025",
  imageUrl: "/file.svg",
  subtitle:
    "Key discussions focused on decarbonization, circular economy and next-generation materials.",
};

const secondaryArticlesMock = [
  {
    id_article: "sec-1",
    titulo: "New Coating Technology Reduces Energy Loss by 40%",
    subtitle: "Breakthrough in low-emissivity glass applications",
    company: "EcoGlass Solutions",
    id_company: "ecoglass-solutions",
    date: "Jan 27, 2025",
    imageUrl: "/file.svg",
  },
  {
    id_article: "sec-2",
    titulo: "European Regulations Push for Stricter Recycling Targets",
    subtitle: "Industry responds to extended producer responsibility",
    company: "EuroGlass Alliance",
    id_company: "euroglass-alliance",
    date: "Jan 26, 2025",
    imageUrl: "/file.svg",
  },
  {
    id_article: "sec-3",
    titulo: "Smart Glass Market to Reach $8.2B by 2030",
    subtitle: "Analysts cite demand from construction and automotive",
    company: "Market Insights Ltd",
    id_company: "market-insights-ltd",
    date: "Jan 25, 2025",
    imageUrl: "/file.svg",
  },
  {
    id_article: "sec-4",
    titulo: "Architectural Glass Awards 2025 Shortlist Announced",
    subtitle: "Twenty projects compete across five categories",
    company: "Glass in Architecture",
    id_company: "glass-in-architecture",
    date: "Jan 24, 2025",
    imageUrl: "/file.svg",
  },
  {
    id_article: "sec-5",
    titulo: "Float Line Expansion to Boost Capacity in North America",
    subtitle: "New facility expected online by late 2026",
    company: "North American Glass Corp",
    id_company: "north-american-glass-corp",
    date: "Jan 23, 2025",
    imageUrl: "/file.svg",
  },
];

const MainNews: FC<MainNewsProps> = () => {
  return (
    <div className="flex flex-row justify-between gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Main featured article */}
      <div className="flex flex-col flex-[2]">
        <article className="group flex flex-col bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 overflow-hidden">
          <Link
            href={`/articles/${mainArticleMock.id_article}`}
            className="relative w-full aspect-[16/9] min-h-[280px] overflow-hidden bg-gray-100 block"
          >
            <Image
              src={mainArticleMock.imageUrl}
              alt={mainArticleMock.titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, 66vw"
              unoptimized
            />
          </Link>
          <div className="flex flex-col p-6 md:p-8 space-y-4">
            <span className="text-xs font-sans uppercase tracking-wider text-blue-600 font-medium">
              {mainArticleMock.topic}
            </span>
            <div className="flex items-center gap-3 text-xs text-gray-500 uppercase tracking-wider font-sans">
              <Link
                href={`/directory/companies/${mainArticleMock.id_company}`}
                className="font-medium hover:text-blue-600 transition-colors"
              >
                {mainArticleMock.company}
              </Link>
              <span className="text-gray-300">•</span>
              <time>{mainArticleMock.date}</time>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight group-hover:text-gray-700 transition-colors line-clamp-3">
              <Link href={`/articles/${mainArticleMock.id_article}`}>
                {mainArticleMock.titulo}
              </Link>
            </h1>
            {mainArticleMock.subtitle && (
              <p className="text-base text-gray-600 font-sans leading-relaxed line-clamp-2">
                {mainArticleMock.subtitle}
              </p>
            )}
            <div className="pt-4 border-t border-gray-100">
              <Link
                href={`/articles/${mainArticleMock.id_article}`}
                className="text-xs text-gray-400 font-sans uppercase tracking-wider group-hover:text-gray-600 transition-colors inline-block"
              >
                Read more →
              </Link>
            </div>
          </div>
        </article>
      </div>

      {/* Secondary articles as cards */}
      <div className="flex flex-col flex-1 gap-4">
        {secondaryArticlesMock.map((article) => (
          <article
            key={article.id_article}
            className="group flex flex-row gap-4 p-4 bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300"
          >
            <Link
              href={`/articles/${article.id_article}`}
              className="relative shrink-0 w-24 h-24 md:w-28 md:h-28 overflow-hidden bg-gray-100"
            >
              <Image
                src={article.imageUrl}
                alt={article.titulo}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="112px"
                unoptimized
              />
            </Link>
            <div className="flex flex-col min-w-0 flex-1 justify-center">
              <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-sans mb-1">
                <Link
                  href={`/directory/companies/${article.id_company}`}
                  className="font-medium hover:text-blue-600 transition-colors truncate"
                >
                  {article.company}
                </Link>
                <span className="text-gray-300 shrink-0">•</span>
                <time className="shrink-0">{article.date}</time>
              </div>
              <h2 className="font-serif text-sm md:text-base font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-gray-700">
                <Link href={`/articles/${article.id_article}`}>
                  {article.titulo}
                </Link>
              </h2>
              {article.subtitle && (
                <p className="text-xs text-gray-600 font-sans line-clamp-2 mt-0.5">
                  {article.subtitle}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default MainNews;