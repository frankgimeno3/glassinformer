'use client';

import React, { FC, useState } from 'react';
import Link from 'next/link';

interface MySettingsProps {}

const MySettings: FC<MySettingsProps> = () => {
  const [language, setLanguage] = useState<'ES' | 'ENG'>('ENG');

  return (
    <div className="bg-white min-h-[60vh] rounded-lg shadow p-6 md:p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">User settings</h1>

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
        <Link
          href="/logged/settings/subscriptions"
          className="group flex flex-row items-start pl-4 py-4 border-b border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5 flex-shrink-0 mr-3 text-blue-950" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.41 1.41l4.59-4.59a1 1 0 0 0 0-1.41L10.7 6.71a1 1 0 0 0-1.41 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-700 group-hover:text-blue-950 group-hover:underline">
              My subscriptions
            </span>
            <p className="mt-1 text-xs text-gray-500">
              Manage which mailing lists you are in across the current portal and the rest of the Plynium network,
              including newsletters you receive and magazines you are digitally subscribed to.
            </p>
          </div>
        </Link>

        {/* Content Preferences */}
        <Link
          href="/logged/settings/content-preferences"
          className="group flex flex-row items-start pl-4 py-4 border-b border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5 flex-shrink-0 mr-3 text-blue-950" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.41 1.41l4.59-4.59a1 1 0 0 0 0-1.41L10.7 6.71a1 1 0 0 0-1.41 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-700 group-hover:text-blue-950 group-hover:underline">
              Content Preferences
            </span>
            <p className="mt-1 text-xs text-gray-500">
              Manage your preferences for how information is shown in your feed.
            </p>
          </div>
        </Link>

        {/* Account settings */}
        <Link
          href="/logged/settings/account-settings"
          className="group flex flex-row items-start pl-4 py-4 border-b border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5 flex-shrink-0 mr-3 text-blue-950" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.41 1.41l4.59-4.59a1 1 0 0 0 0-1.41L10.7 6.71a1 1 0 0 0-1.41 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-700 group-hover:text-blue-950 group-hover:underline">
              Account settings
            </span>
            <p className="mt-1 text-xs text-gray-500">
              Change your email, password, or delete your account.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Company settings can only be modified by an administrator from the company admin view.
            </p>
          </div>
        </Link>
      </nav>
    </div>
  );
};

export default MySettings;
