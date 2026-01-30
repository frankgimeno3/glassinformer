'use client';

import React, { FC, useState } from 'react';
import Link from 'next/link';

interface MySettingsProps {}

const MySettings: FC<MySettingsProps> = () => {
  const [language, setLanguage] = useState<'ES' | 'ENG'>('ENG');

  return (
    <div className="bg-white min-h-[60vh] rounded-lg shadow p-6 md:p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">Settings</h1>

      <nav className="flex flex-col gap-1">
        {/* Preferred language */}
        <div className="pl-4 flex flex-wrap items-center justify-between gap-4 py-4 border-b border-gray-200">
          <span className="text-gray-700 font-medium">Preferred language</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLanguage('ES')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                language === 'ES'
                  ? 'bg-blue-950 text-white border-blue-950'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ENG')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                language === 'ENG'
                  ? 'bg-blue-950 text-white border-blue-950'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              ENG
            </button>
          </div>
        </div>
        {/* My subscriptions */}
        <div className="flex flex-row items-center pl-4 py-4 border-b border-gray-200 text-gray-700 font-medium hover:text-blue-950 hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 flex-shrink-0 mr-3 text-blue-950" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.41 1.41l4.59-4.59a1 1 0 0 0 0-1.41L10.7 6.71a1 1 0 0 0-1.41 0z" />
          </svg>
          <Link href="/logged/settings/subscriptions" className="flex-1 hover:no-underline text-inherit">
            My subscriptions
          </Link>
        </div>

        {/* Content Preferences */}
        <div className="flex flex-row items-center pl-4 py-4 border-b border-gray-200 text-gray-700 font-medium hover:text-blue-950 hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 flex-shrink-0 mr-3 text-blue-950" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.41 1.41l4.59-4.59a1 1 0 0 0 0-1.41L10.7 6.71a1 1 0 0 0-1.41 0z" />
          </svg>
          <Link href="/logged/settings/content-preferences" className="flex-1 hover:no-underline text-inherit">
            Content Preferences
          </Link>
        </div>

        {/* Account settings */}
        <div className="flex flex-row items-center pl-4 py-4 border-b border-gray-200 text-gray-700 font-medium hover:text-blue-950 hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 flex-shrink-0 mr-3 text-blue-950" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.41 1.41l4.59-4.59a1 1 0 0 0 0-1.41L10.7 6.71a1 1 0 0 0-1.41 0z" />
          </svg>
          <Link href="/logged/settings/account-settings" className="flex-1 hover:no-underline text-inherit">
            Account settings
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default MySettings;
