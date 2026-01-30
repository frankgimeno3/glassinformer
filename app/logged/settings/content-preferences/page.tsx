'use client';

import React, { FC, useState, useCallback } from 'react';
import Link from 'next/link';
import usersData from '@/app/contents/usersData.json';

export const CONTENT_TOPICS = [
  'Architectural glass',
  'Automotive glass',
  'Hollow glass',
  'Glass machinery',
  'Glass components',
  'Flat glass',
  'Smart glass',
  'Energy-efficient glazing',
  'Glass coatings',
  'Container glass',
  'Solar glass',
  'Glass recycling',
  'Glass furnaces',
  'Float glass',
  'Tempered glass',
  'Laminated glass',
  'Glass insulation',
  'Decorative glass',
  'Technical glass',
  'Glass raw materials',
] as const;

type Topic = (typeof CONTENT_TOPICS)[number];

type UserWithPreferences = { interestedTopics?: string[]; DoNotShow?: string[] };
const currentUser = (usersData as UserWithPreferences[])[0];
const initialInterested = new Set<string>(currentUser?.interestedTopics ?? []);
const initialDoNotShow = new Set<string>(currentUser?.DoNotShow ?? []);

interface ContentPreferencesProps {}

const ContentPreferences: FC<ContentPreferencesProps> = () => {
  const [interested, setInterested] = useState<Set<string>>(() => initialInterested);
  const [doNotShow, setDoNotShow] = useState<Set<string>>(() => initialDoNotShow);
  const [openInterested, setOpenInterested] = useState(true);
  const [openDoNot, setOpenDoNot] = useState(true);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ topic: string } | null>(null);

  const isDisabled = useCallback(
    (topic: string) => doNotShow.has(topic),
    [doNotShow]
  );

  const handleInterestedToggle = useCallback(
    (topic: string) => {
      if (doNotShow.has(topic)) return;
      setInterested((prev) => {
        const next = new Set(prev);
        if (next.has(topic)) next.delete(topic);
        else next.add(topic);
        return next;
      });
      setShowSavePopup(true);
    },
    [doNotShow]
  );

  const handleDoNotShowToggle = useCallback((topic: string) => {
    if (doNotShow.has(topic)) return; // already in do-not-show, disabled
    setConfirmModal({ topic });
  }, [doNotShow]);

  const handleConfirmDoNot = useCallback(() => {
    if (!confirmModal) return;
    const { topic } = confirmModal;
    setDoNotShow((prev) => new Set(prev).add(topic));
    setInterested((prev) => {
      const next = new Set(prev);
      next.delete(topic);
      return next;
    });
    setConfirmModal(null);
    setShowSavePopup(true);
  }, [confirmModal]);

  const handleSaveChanges = useCallback(() => {
    setShowSavePopup(false);
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
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Content preferences</h1>
      <p className="text-gray-600 text-sm mb-8">
        From here you can set the priorities for the articles you read and tailor your feed to your interests.
      </p>

      {/* Content I am interested in */}
      <section className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenInterested((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left font-medium text-gray-800"
        >
          Content I am interested in
          <span className="text-gray-500">{openInterested ? '▼' : '▶'}</span>
        </button>
        {openInterested && (
          <div className="p-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CONTENT_TOPICS.map((topic) => {
              const disabled = isDisabled(topic);
              return (
                <label
                  key={topic}
                  className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <input
                    type="checkbox"
                    checked={interested.has(topic)}
                    onChange={() => handleInterestedToggle(topic)}
                    disabled={disabled}
                    className="rounded border-gray-300 text-blue-950 focus:ring-blue-950 disabled:bg-gray-200 disabled:border-gray-300"
                  />
                  <span className={disabled ? 'text-gray-400' : 'text-gray-700'}>{topic}</span>
                </label>
              );
            })}
          </div>
        )}
      </section>

      {/* Content I don&apos;t want to know about */}
      <section className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenDoNot((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left font-medium text-gray-800"
        >
          Content I don&apos;t want to know about
          <span className="text-gray-500">{openDoNot ? '▼' : '▶'}</span>
        </button>
        {openDoNot && (
          <div className="p-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CONTENT_TOPICS.map((topic) => {
              const disabled = doNotShow.has(topic);
              return (
                <label
                  key={topic}
                  className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <input
                    type="checkbox"
                    checked={doNotShow.has(topic)}
                    onChange={() => handleDoNotShowToggle(topic)}
                    disabled={disabled}
                    className="rounded border-gray-300 text-blue-950 focus:ring-blue-950 disabled:bg-gray-200 disabled:border-gray-300"
                  />
                  <span className={disabled ? 'text-gray-400' : 'text-gray-700'}>{topic}</span>
                </label>
              );
            })}
          </div>
        )}
      </section>

      {/* Save changes popup */}
      {showSavePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-sm w-full">
            <p className="text-gray-800 font-medium mb-4">Save changes?</p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowSavePopup(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-4 py-2 rounded-lg bg-blue-950 text-white hover:bg-blue-900"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm add to Do Not Show modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-sm w-full relative">
            <button
              type="button"
              onClick={() => setConfirmModal(null)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              aria-label="Cancel"
            >
              ✕
            </button>
            <p className="text-gray-800 font-medium mb-2">Confirm change</p>
            <p className="text-gray-600 text-sm mb-4">
              Add &quot;{confirmModal.topic}&quot; to content you don&apos;t want to see? It will be removed from your
              interests if selected.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDoNot}
                className="px-4 py-2 rounded-lg bg-blue-950 text-white hover:bg-blue-900"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentPreferences;
