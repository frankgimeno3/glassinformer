'use client';

import React, { FC, useState } from 'react';
import Link from 'next/link';

type TabId = 'email' | 'password' | 'delete';

interface AccountSettingsProps {}

const AccountSettings: FC<AccountSettingsProps> = () => {
  const [activeTab, setActiveTab] = useState<TabId>('email');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'email', label: 'Change email' },
    { id: 'password', label: 'Change password' },
    { id: 'delete', label: 'Delete account' },
  ];

  return (
    <div className="bg-white min-h-[60vh] rounded-lg shadow p-6 md:p-8">
      <Link
        href="/logged/settings"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 hover:underline cursor-pointer mb-6"
      >
        ← Back to settings
      </Link>
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">Account settings</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors -mb-px ${
              activeTab === id
                ? 'border-blue-950 text-blue-950'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === 'email' && (
          <div className="space-y-4 max-w-md">
            <p className="text-gray-600 text-sm">Update your email address.</p>
            <div>
              <label htmlFor="current-email" className="block text-sm font-medium text-gray-700 mb-1">
                Current email
              </label>
              <input
                id="current-email"
                type="email"
                placeholder="current@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-blue-950"
              />
            </div>
            <div>
              <label htmlFor="new-email" className="block text-sm font-medium text-gray-700 mb-1">
                New email
              </label>
              <input
                id="new-email"
                type="email"
                placeholder="new@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-blue-950"
              />
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-blue-950 text-white hover:bg-blue-900 transition-colors"
            >
              Save email
            </button>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="space-y-4 max-w-md">
            <p className="text-gray-600 text-sm">Change your password.</p>
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-blue-950"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-blue-950"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-blue-950"
              />
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-blue-950 text-white hover:bg-blue-900 transition-colors"
            >
              Save password
            </button>
          </div>
        )}

        {activeTab === 'delete' && (
          <div className="space-y-4 max-w-md">
            <p className="text-gray-600 text-sm">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Delete account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;
