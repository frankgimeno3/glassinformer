'use client';

import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'; 

import { ArticleService } from "@/service/ArticleService";
import { ContentService } from "@/service/ContentService";
 
const Article = () => {
  const router = useRouter();
  const params = useParams();

  const ArticleId = params?.id_article as string;
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch article
        const article = await ArticleService.getArticleById(ArticleId);
        setSelectedArticle(article);

        // Fetch all contents to have them available for rendering
        const allContents = await ContentService.getAllContents();
        setContents(Array.isArray(allContents) ? allContents : []);
      } catch (err: any) {
        console.error("Error fetching article data:", err);
        setError(err?.message || "Error loading article");
      } finally {
        setLoading(false);
      }
    };

    if (ArticleId) {
      fetchArticleData();
    }
  }, [ArticleId]);

  if (loading) {
    return (
      <div className="flex flex-col h-full min-h-screen text-gray-600 px-6 py-10 gap-6 items-center justify-center">
        <p className="text-lg">Loading article...</p>
      </div>
    );
  }

  if (error || !selectedArticle) {
    return (
      <div className="flex flex-col h-full min-h-screen text-gray-600 px-6 py-10 gap-6 items-center justify-center">
        <p className="text-red-500 text-lg">
          {error || "The article you are looking for doesn't exist."}
        </p>
        <button
          onClick={() => router.push("/articles")}
          className="mt-4 px-4 py-2 bg-blue-950 text-white rounded-xl"
        >
          Back to articles
        </button>
      </div>
    );
  }

  const renderHtml = (html: string | undefined) => {
    if (html == null || html === "") return null;
    const str = typeof html === "string" ? html : String(html);
    return (
      <div
        className="article-body max-w-4xl"
        dangerouslySetInnerHTML={{ __html: str }}
      />
    );
  };

  const renderContent = (contentId: string) => {
    const contentData = contents.find((c: any) => c.content_id === contentId);

    if (!contentData) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          ❌ Content not found: {contentId}
        </div>
      );
    }

    const { content_type, content_content } = contentData;

    if (content_type === "just_text") {
      return (
        <div className="w-full flex justify-start">
          {renderHtml(content_content?.center)}
        </div>
      );
    }

    if (content_type === "just_image") {
      return (
        <div className="w-full flex justify-start">
          <img
            src={content_content?.center}
            alt="content image"
            className="w-full max-w-4xl rounded-lg object-contain"
          />
        </div>
      );
    }

    if (content_type === "text_image") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="min-w-0">{renderHtml(content_content?.left)}</div>
          <img
            src={content_content?.right}
            alt="content image"
            className="w-full max-w-2xl rounded-lg object-contain"
          />
        </div>
      );
    }

    if (content_type === "image_text") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <img
            src={content_content?.left}
            alt="content image"
            className="w-full max-w-2xl rounded-lg object-contain"
          />
          <div className="min-w-0">{renderHtml(content_content?.right)}</div>
        </div>
      );
    }

    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
        ⚠ Unknown content type: {content_type}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-screen text-gray-600 px-6 py-10 gap-6">

      <h1 className="text-4xl font-bold">{selectedArticle.articleTitle}</h1>
      <h2 className="text-xl text-gray-500">{selectedArticle.articleSubtitle}</h2>

      <img
        src={selectedArticle.article_main_image_url}
        alt={selectedArticle.articleTitle}
        className="w-full rounded-lg shadow-md"
      />

      <div className="flex flex-wrap gap-2 mt-4">
        {(selectedArticle.article_tags_array || []).map((tag: string) => (
          <span 
            key={tag}
            className="px-3 py-1 bg-gray-200 rounded-full text-sm cursor-pointer hover:bg-gray-200/50"
            onClick={()=>{router.push(`/search/tags=${tag}`)}}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-8 max-w-4xl">
        {(selectedArticle.contents_array || []).map((contentId: string) => (
          <section key={contentId} className="flex flex-col gap-4">
            {renderContent(contentId)}
          </section>
        ))}
      </div>

    </div>
  );
};

export default Article;
