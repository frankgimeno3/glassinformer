'use client';

import React, { FC, useState, useCallback } from 'react';
import Link from 'next/link';

const NEWSLETTER_TOPICS = [
  'Architectural glass',
  'Automotive glass',
  'Hollow Glass',
  'Glass machinery',
  'Glass components',
  'About glass factories',
] as const;

interface MySubscriptionsProps {}

const MySubscriptions: FC<MySubscriptionsProps> = () => {
  const [newsletter, setNewsletter] = useState<Record<string, boolean>>(
    NEWSLETTER_TOPICS.reduce((acc, t) => ({ ...acc, [t]: false }), {})
  );
  const [magazine, setMagazine] = useState(true); // Glassinformer Magazine selected by default
  const [hasChanges, setHasChanges] = useState(false);

  const handleNewsletterChange = useCallback((topic: string) => {
    setNewsletter((prev) => ({ ...prev, [topic]: !prev[topic] }));
    setHasChanges(true);
  }, []);

  const handleMagazineChange = useCallback(() => {
    setMagazine((prev) => !prev);
    setHasChanges(true);
  }, []);

  const handleUpdatePreferences = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="bg-white min-h-[60vh] rounded-lg shadow p-6 md:p-8">
      <Link
        href="/logged/settings"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 hover:underline cursor-pointer mb-6"
      >
        ← Back to settings
      </Link>
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">My subscriptions</h1>

      {/* Newsletter */}
      <section className="mb-10">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Newsletter</h2>
        <p className="text-sm text-gray-500 mb-4">Choose the topics you want to receive in your newsletter.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {NEWSLETTER_TOPICS.map((topic) => (
            <label key={topic} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newsletter[topic] ?? false}
                onChange={() => handleNewsletterChange(topic)}
                className="rounded border-gray-300 text-blue-950 focus:ring-blue-950"
              />
              <span className="text-gray-700">{topic}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Magazines */}
      <section>
        <h2 className="text-lg font-medium text-gray-700 mb-4">Magazines</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={magazine}
            onChange={handleMagazineChange}
            className="rounded border-gray-300 text-blue-950 focus:ring-blue-950"
          />
          <span className="text-gray-700">Glassinformer Magazine</span>
        </label>
      </section>

      {/* Floating button */}
      {hasChanges && (
        <div className="fixed bottom-6 left-6 z-40">
          <button
            type="button"
            onClick={handleUpdatePreferences}
            className="px-5 py-3 rounded-lg shadow-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            Update my preferences
          </button>
        </div>
      )}
    </div>
  );
};

export default MySubscriptions;
