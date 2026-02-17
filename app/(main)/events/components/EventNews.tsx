'use client';

import React, { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArticleService } from '@/apiClient/ArticleService';
import { EventService } from '@/apiClient/EventService';
import type { Event } from './EventsCalendar';

export interface EventNewsArticle {
  id_article: string;
  articleTitle: string;
  articleSubtitle?: string;
  article_main_image_url?: string;
  date?: string;
  company?: string;
  is_article_event?: boolean;
  isEventNews?: boolean;
  event_id?: string | null;
}

const EventNews: FC = () => {
  const router = useRouter();
  const [articles, setArticles] = useState<EventNewsArticle[]>([]);
  const [eventsMap, setEventsMap] = useState<Record<string, Event>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [articlesData, eventsData] = await Promise.all([
          ArticleService.getAllArticles(),
          EventService.getAllEvents(),
        ]);
        const filtered = (Array.isArray(articlesData) ? articlesData : [])
          .filter(
            (a: any) =>
              a &&
              a.id_article &&
              (a.is_article_event === true || a.isEventNews === true)
          )
          .sort((a: any, b: any) => {
            const dateA = new Date(a.date || 0).getTime();
            const dateB = new Date(b.date || 0).getTime();
            return dateB - dateA;
          });
        setArticles(filtered);
        const map: Record<string, Event> = {};
        (eventsData || []).forEach((e: Event) => {
          map[e.id_fair] = e;
        });
        setEventsMap(map);
      } catch (error) {
        console.error('Error loading event news:', error);
        setArticles([]);
        setEventsMap({});
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCardClick = (idArticle: string) => {
    router.push(`/articles/${idArticle}`);
  };

  const handleEventNameClick = (e: React.MouseEvent, idEvent: string) => {
    e.stopPropagation();
    router.push(`/events/${idEvent}`);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Loading event news...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No event news available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article) => {
        const event = article.event_id ? eventsMap[article.event_id] : null;
        const imageUrl = article.article_main_image_url || '/file.svg';
        return (
          <div
            key={article.id_article}
            onClick={() => handleCardClick(article.id_article)}
            className="flex border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer"
          >
            {/* Thumbnail left */}
            <div className="w-28 sm:w-32 flex-shrink-0 relative bg-gray-100">
              <Image
                src={imageUrl}
                alt={article.articleTitle || 'Article'}
                fill
                className="object-cover"
                sizes="128px"
                unoptimized
              />
            </div>
            {/* Content right: article title + event info */}
            <div className="flex-1 min-w-0 p-4 flex flex-col justify-center">
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                {article.articleTitle}
              </h3>
              {article.date && (
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(article.date).toLocaleDateString()}
                </p>
              )}
              {event ? (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Related event</p>
                  <button
                    type="button"
                    onClick={(e) => handleEventNameClick(e, event.id_fair)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                  >
                    {event.event_name}
                  </button>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {event.location}
                    {event.start_date && (
                      <> · {new Date(event.start_date).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
              ) : article.event_id ? (
                <p className="text-xs text-gray-400 mt-2">Event data unavailable</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventNews;
