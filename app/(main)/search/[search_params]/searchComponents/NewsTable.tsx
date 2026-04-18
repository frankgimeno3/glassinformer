'use client';

import React, { FC, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArticleService } from '@/apiClient/ArticleService';

interface NewsItem {
  id_article: string;
  articleTitle: string;
  articleSubtitle: string;
  date: string;
  company?: string;
}

interface NewsTableProps {
  searchTerm: string;
}

const NewsTable: FC<NewsTableProps> = ({ searchTerm }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await ArticleService.getAllArticles();
        setNews(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'Error loading news';
        setError(message);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return news;
    return news.filter((item) => {
      const title = (item.articleTitle ?? '').toLowerCase();
      const subtitle = (item.articleSubtitle ?? '').toLowerCase();
      const company = (item.company ?? '').toLowerCase();
      return title.includes(term) || subtitle.includes(term) || company.includes(term);
    });
  }, [news, searchTerm]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {loading && (
        <div className="px-6 py-4 text-sm text-gray-600">Loading news...</div>
      )}
      {error && (
        <div className="px-6 py-4 text-sm text-red-700 bg-red-50 border-b border-red-200">
          {error}
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtitle</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                {loading ? '—' : `No news found for "${searchTerm}"`}
              </td>
            </tr>
          ) : (
            filtered.map((item) => (
              <tr key={item.id_article} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/articles/${item.id_article}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    {item.articleTitle}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">{item.articleSubtitle}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.company ?? '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{item.date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default NewsTable;
