'use client';

import React, { FC } from 'react';
import Link from 'next/link';

interface NewsItem {
  id_article: string;
  articleTitle: string;
  articleSubtitle: string;
  date: string;
  company?: string;
}

const MOCK_NEWS: NewsItem[] = [
  { id_article: '1', articleTitle: 'Industry trends 2025', articleSubtitle: 'Overview of key developments', date: '2025-01-15', company: 'Glass Corp' },
  { id_article: '2', articleTitle: 'New manufacturing standards', articleSubtitle: 'Regulatory update', date: '2025-01-10', company: 'Pane Ltd' },
  { id_article: '3', articleTitle: 'Sustainability in glass production', articleSubtitle: 'Green initiatives', date: '2025-01-05', company: 'EcoGlass' },
];

interface NewsTableProps {
  searchTerm: string;
}

const NewsTable: FC<NewsTableProps> = ({ searchTerm }) => {
  const filtered = MOCK_NEWS.filter(
    (item) =>
      item.articleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.articleSubtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.company && item.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
                No news found for &quot;{searchTerm}&quot;
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
