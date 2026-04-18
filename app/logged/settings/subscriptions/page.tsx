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

      <div className="space-y-10">
        {/* Portal-specific */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-gray-900">This portal (Glassinformer)</h2>
            <p className="mt-1 text-sm text-gray-600">
              Subscriptions that only apply to the current portal you are browsing.
            </p>
          </div>
          <div className="px-4 py-5 sm:px-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Digital magazines
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={magazine}
                  onChange={handleMagazineChange}
                  className="rounded border-gray-300 text-blue-950 focus:ring-blue-950"
                />
                <span className="text-gray-700">Glassinformer Magazine</span>
              </label>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Newsletter topics
              </h3>
              <p className="text-sm text-gray-600 mb-3 rounded-md bg-gray-50 border border-gray-100 px-3 py-2">
                If you opted in during sign-up, your account is linked to the portal main newsletter list in RDS
                (<code className="text-xs">user_list_subscriptions</code>). Topic checkboxes below are UI-only until
                they are wired to the same database.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Choose the topics you want to receive in your newsletters for this portal.
              </p>
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
            </div>
          </div>
        </section>

        {/* Network-wide */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-gray-900">Plynium Network</h2>
            <p className="mt-1 text-sm text-gray-600">
              Subscriptions that can apply across multiple portals in the Plynium network.
            </p>
          </div>
          <div className="px-4 py-5 sm:px-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Digital magazines
              </h3>
              <p className="text-sm text-gray-500">
                Network-wide magazine subscriptions are not available yet.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Newsletter topics
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Network-wide newsletter subscriptions are not available yet.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-60">
                {NEWSLETTER_TOPICS.map((topic) => (
                  <label key={topic} className="flex items-center gap-2 cursor-not-allowed">
                    <input
                      type="checkbox"
                      checked={false}
                      disabled
                      className="rounded border-gray-300 text-blue-950 focus:ring-blue-950"
                    />
                    <span className="text-gray-700">{topic}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating button */}
      {hasChanges && (
        <div className="fixed bottom-6 left-6 z-40">
          <button
            type="button"
            onClick={handleUpdatePreferences}
            className="px-5 py-3 rounded-lg shadow-lg bg-blue-950 hover:bg-blue-950/90 text-white font-semibold uppercase tracking-wider transition-colors"
          >
            Update preferences
          </button>
        </div>
      )}
    </div>
  );
};

export default MySubscriptions;
