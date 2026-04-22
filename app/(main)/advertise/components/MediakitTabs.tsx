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
    <div className="mb-6 flex flex-wrap justify-center gap-2 border-b border-gray-200 pb-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2.5 rounded-t-lg font-medium transition-colors ${
            activeTab === tab.id
              ? 'border-b-2 border-blue-950 bg-white text-gray-900'
              : 'border-b-2 border-transparent bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default MediakitTabs;
