'use client';

import CommentsSection from "../article_components/CommentsSection";
import RelatedContent from "../article_components/RelatedContent";
import DeleteArticleModal from "../article_components/DeleteArticleModal";
import ArticleLoadingState from "../article_components/ArticleLoadingState";
import ArticleErrorState from "../article_components/ArticleErrorState";
import ArticleHero from "../article_components/ArticleHero";
import ArticleHeader, { ArticleTags } from "../article_components/ArticleHeader";
import ArticleBody from "../article_components/ArticleBody";

import { useArticlePage } from "./useArticlePage";

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
      <ArticleHero
        imageUrl={selectedArticle.article_main_image_url}
        alt={selectedArticle.articleTitle}
      />

      <div className="w-full p-6 md:p-8 bg-white shadow-sm border-y border-gray-100">
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

      <div className="w-full">
        <CommentsSection idArticle={articleId} />
      </div>
      <RelatedContent />

      <DeleteArticleModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteArticle}
        isDeleting={isDeleting}
      />
    </div>
  );
}
