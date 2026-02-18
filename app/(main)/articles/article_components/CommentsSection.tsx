"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AuthenticationService from "@/apiClient/AuthenticationService";
import { CommentService } from "@/apiClient/CommentService";
import apiClient from "@/app/apiClient";
import ConfirmDeleteCommentModal from "./ConfirmDeleteCommentModal";

const COMMENTS_PAGE_SIZE = 10;

function formatDateTime(isoString: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return isoString;
  }
}

interface CommentItem {
  id_comment: string;
  id_timestamp: string | null;
  comment_id_user: string;
  comment_content: string;
  user_name: string;
  user_surnames: string;
}

interface CommentsSectionProps {
  idArticle: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ idArticle }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(
    async (offset: number, append: boolean) => {
      const setLoadingState = append ? setLoadingMore : setLoading;
      setLoadingState(true);
      setError(null);
      try {
        const { comments: list, total: t } = await CommentService.getComments(
          idArticle,
          { limit: COMMENTS_PAGE_SIZE, offset }
        );
        const items = list as CommentItem[];
        if (append) {
          setComments((prev) => [...prev, ...items]);
        } else {
          setComments(items);
        }
        setTotal(t);
      } catch (err: unknown) {
        const e = err as { message?: string };
        setError(e?.message ?? "Error loading comments");
        if (!append) setComments([]);
      } finally {
        setLoadingState(false);
      }
    },
    [idArticle]
  );

  useEffect(() => {
    let cancelled = false;
    AuthenticationService.isAuthenticated().then((auth) => {
      if (!cancelled) setIsLogged(auth);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLogged) {
      setCurrentUserId(null);
      return;
    }
    let cancelled = false;
    apiClient.get<{ id_user: string }>("/api/v1/users/me").then((res) => {
      if (!cancelled) setCurrentUserId(res.data?.id_user ?? null);
    }).catch(() => {
      if (!cancelled) setCurrentUserId(null);
    });
    return () => { cancelled = true; };
  }, [isLogged]);

  useEffect(() => {
    if (!isLogged) {
      setLoading(false);
      setComments([]);
      setTotal(0);
      return;
    }
    fetchComments(0, false);
  }, [isLogged, fetchComments]);

  const handleLoadMore = () => {
    fetchComments(comments.length, true);
  };

  const handleDeleteComment = async (idComment: string) => {
    if (deletingId) return;
    setDeletingId(idComment);
    setError(null);
    try {
      await CommentService.deleteComment(idArticle, idComment);
      setComments((prev) => prev.filter((c) => c.id_comment !== idComment));
      setTotal((prev) => Math.max(0, prev - 1));
      setCommentToDelete(null);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "Error deleting comment");
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirmDeleteComment = () => {
    if (commentToDelete) handleDeleteComment(commentToDelete);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = (await CommentService.createComment(idArticle, content)) as CommentItem;
      setComments((prev) => [created, ...prev]);
      setTotal((prev) => prev + 1);
      setNewComment("");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "Error posting comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLogged) {
    return (
      <section className="mt-0 p-6 md:p-8 bg-white shadow-sm border-y border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Comments</h2>
        <p className="text-gray-600 mb-4">
          Log in to see the comments on this article.
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-4 py-2 bg-blue-950 text-white rounded-lg hover:opacity-90"
        >
          Log in
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-0 p-6 md:p-8 bg-white shadow-sm border-y border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Comments</h2>

      <form onSubmit={handleSubmitComment} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-transparent resize-y"
          maxLength={10000}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="mt-2 px-4 py-2 bg-blue-950 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending…" : "Comment"}
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm mb-4" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">No comments yet. Be the first to comment.</p>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {comments.map((c) => (
              <article
                key={c.id_comment}
                className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 shadow-sm flex flex-wrap gap-4 items-start justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2 text-sm text-gray-600 mb-2">
                    <Link
                      href={`/logged/profiles/${encodeURIComponent(c.comment_id_user)}`}
                      className="font-medium text-gray-800 hover:text-blue-950 hover:underline"
                    >
                      {[c.user_name, c.user_surnames].filter(Boolean).join(" ") || c.comment_id_user}
                    </Link>
                    <span className="text-gray-500">
                      {formatDateTime(c.id_timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{c.comment_content}</p>
                </div>
                {currentUserId === c.comment_id_user && (
                  <button
                    type="button"
                    onClick={() => setCommentToDelete(c.id_comment)}
                    disabled={deletingId === c.id_comment}
                    className="shrink-0 px-3 py-1.5 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === c.id_comment ? "…" : "Delete"}
                  </button>
                )}
              </article>
            ))}
          </div>
          {comments.length < total && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Show more"}
              </button>
            </div>
          )}
          {comments.length > 0 && comments.length >= total && total > COMMENTS_PAGE_SIZE && (
            <p className="mt-4 text-center text-gray-500 text-sm">
              No more comments.
            </p>
          )}
        </>
      )}

      <ConfirmDeleteCommentModal
        open={commentToDelete != null}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleConfirmDeleteComment}
        isDeleting={deletingId != null}
      />
    </section>
  );
};

export default CommentsSection;
