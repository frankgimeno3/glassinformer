'use client';

import React, { FC, useState } from 'react';
import Link from 'next/link';
import EventsCalendar from './components/EventsCalendar';
import EventNews from './components/EventNews';

interface IndustryEventsProps {}

const IndustryEvents: FC<IndustryEventsProps> = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'calendar'>('calendar');

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Industry Events</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'border-b-2 border-blue-600 text-blue-600 -mb-px'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Events Calendar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('news')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'news'
                ? 'border-b-2 border-blue-600 text-blue-600 -mb-px'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Event News
          </button>
        </div>
        <div className="flex-shrink-0 pb-3 sm:pb-3 self-start sm:self-auto">
          <Link
            href="/events/add"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Add your event
          </Link>
        </div>
      </div>

      {activeTab === 'news' && <EventNews />}
      {activeTab === 'calendar' && <EventsCalendar />}
    </div>
  );
};

export default IndustryEvents;
