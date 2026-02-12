'use client';

import React, { FC, useState } from 'react';
import EventsCalendar from './components/EventsCalendar';
import EventNews from './components/EventNews';

interface IndustryEventsProps {}

const IndustryEvents: FC<IndustryEventsProps> = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'calendar'>('calendar');

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Industry Events</h1>

      <div className="flex gap-4 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'calendar'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Events Calendar
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'news'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Event News
        </button>
      </div>

      {activeTab === 'news' && <EventNews />}
      {activeTab === 'calendar' && <EventsCalendar />}
    </div>
  );
};

export default IndustryEvents;
