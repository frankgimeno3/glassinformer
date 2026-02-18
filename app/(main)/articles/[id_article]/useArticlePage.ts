'use client';

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ArticleService } from "@/apiClient/ArticleService";
import { ContentService } from "@/apiClient/ContentService";
import AuthenticationService from "@/apiClient/AuthenticationService";
import apiClient from "@/app/apiClient";

export interface ArticleData {
  article_main_image_url: string;
  articleTitle: string;
  articleSubtitle?: string;
  date?: string | null;
  author?: string;
  article_tags_array?: string[];
  contents_array?: string[];
}

export function useArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id_article as string;

  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        setLoading(true);
        setError(null);
        const article = await ArticleService.getArticleById(articleId);
        setSelectedArticle(article);
        const allContents = await ContentService.getAllContents();
        setContents(Array.isArray(allContents) ? allContents : []);
      } catch (err: any) {
        console.error("Error fetching article data:", err);
        setError(err?.message || "Error loading article");
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchArticleData();
    }
  }, [articleId]);

  useEffect(() => {
    let cancelled = false;
    AuthenticationService.isAuthenticated().then((auth) => {
      if (cancelled) return;
      if (!auth) {
        setCurrentUserId(null);
        return;
      }
      apiClient.get<{ id_user: string }>("/api/v1/users/me").then((res) => {
        if (!cancelled) setCurrentUserId(res.data?.id_user ?? null);
      }).catch(() => {
        if (!cancelled) setCurrentUserId(null);
      });
    });
    return () => { cancelled = true; };
  }, []);

  const isOwner =
    Boolean(currentUserId && selectedArticle?.author === currentUserId) ||
    Boolean(currentUserId && selectedArticle && !selectedArticle.author);

  const handleDeleteArticle = async () => {
    if (!articleId || isDeleting) return;
    setIsDeleting(true);
    try {
      await ArticleService.deleteArticle(articleId);
      setDeleteModalOpen(false);
      router.push("/articles");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "Error deleting article");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
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
  };
}
