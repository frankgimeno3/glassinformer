'use client';

import React, { FC } from 'react';
import type { TabId } from '../types';

interface MediakitTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'news-portal', label: 'News Portal Advertising' },
  { id: 'magazine', label: 'Magazine Advertising' },
  { id: 'other-services', label: 'Other services' },
];

const MediakitTabs: FC<MediakitTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6 justify-center">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2.5 rounded-t-lg font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white border-b-2 border-blue-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-b-2 border-transparent'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default MediakitTabs;
