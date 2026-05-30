'use client';

import CommentsSection from "../article_components/CommentsSection";
import DeleteArticleModal from "../article_components/DeleteArticleModal";
import MidBanner, {
  type MidBannerVariant,
} from "@/app/general_components/banners/MidBanner";
import { articlePageRelatedMidVariant } from "@/app/GlassInformerSpecificData";
import ArticleLoadingState from "../article_components/ArticleLoadingState";
import ArticleErrorState from "../article_components/ArticleErrorState";
import ArticleHero from "../article_components/ArticleHero";
import ArticleHeader, { ArticleTags } from "../article_components/ArticleHeader";
import ArticleBody from "../article_components/ArticleBody";

import { useArticlePage } from "./useArticlePage";
import Reveal from "@/app/general_components/motion/Reveal";

export default function Article() {
  const {
    router,
    articleId,
    selectedArticle,
    contents,
    loading,
    error,
    deleteModalOpen,
    setDeleteModalOpen,
    isDeleting,
    isOwner,
    handleDeleteArticle,
  } = useArticlePage();

  if (loading) {
    return <ArticleLoadingState />;
  }

  if (error || !selectedArticle) {
    return (
      <ArticleErrorState
        message={error || "The article you are looking for doesn't exist."}
        onBack={() => router.push("/articles")}
      />
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen text-gray-600 py-10 gap-0 w-full">
      <Reveal delayMs={0}>
        <ArticleHero
          imageUrl={selectedArticle.article_main_image_url}
          alt={selectedArticle.articleTitle}
        />
      </Reveal>

      <Reveal delayMs={120}>
        <div className="w-full p-6 md:p-8 bg-white shadow-sm">
          <ArticleHeader
            title={selectedArticle.articleTitle}
            subtitle={selectedArticle.articleSubtitle}
            date={selectedArticle.date}
            isOwner={isOwner}
            onDeleteClick={() => setDeleteModalOpen(true)}
          />
          <ArticleTags
            tags={selectedArticle.article_tags_array || []}
            onTagClick={(tag) => router.push(`/search/tags=${tag}`)}
          />
          <ArticleBody
            contentIds={selectedArticle.contents_array || []}
            contents={contents}
          />
        </div>
      </Reveal>

      <Reveal delayMs={180}>
        <div className="w-full">
          <CommentsSection idArticle={articleId} />
        </div>
      </Reveal>
      <Reveal delayMs={240} className="w-full px-6 md:px-8">
        <MidBanner />
      </Reveal>
      <Reveal delayMs={310} className="w-full px-6 md:px-8">
        <MidBanner
          variant={articlePageRelatedMidVariant as MidBannerVariant}
          excludeArticleId={articleId}
        />
      </Reveal>
      <Reveal delayMs={380} className="w-full px-6 md:px-8">
        <MidBanner />
      </Reveal>

      <DeleteArticleModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteArticle}
        isDeleting={isDeleting}
      />
    </div>
  );
}
