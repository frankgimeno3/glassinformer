'use client';

import React, { FC } from 'react';
import Link from 'next/link';

interface EventItem {
  id_fair: string;
  event_name: string;
  location: string;
  start_date: string;
  end_date: string;
  region: string;
}

const MOCK_EVENTS: EventItem[] = [
  { id_fair: '1', event_name: 'GlassBuild 2025', location: 'Las Vegas', start_date: '2025-09-15', end_date: '2025-09-17', region: 'North America' },
  { id_fair: '2', event_name: 'Glasstec', location: 'Düsseldorf', start_date: '2025-10-21', end_date: '2025-10-24', region: 'Europe' },
  { id_fair: '3', event_name: 'China Glass', location: 'Shanghai', start_date: '2025-04-10', end_date: '2025-04-13', region: 'Asia' },
];

interface EventsTableProps {
  searchTerm: string;
}

const EventsTable: FC<EventsTableProps> = ({ searchTerm }) => {
  const filtered = MOCK_EVENTS.filter(
    (item) =>
      item.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                No events found for &quot;{searchTerm}&quot;
              </td>
            </tr>
          ) : (
            filtered.map((item) => (
              <tr key={item.id_fair} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/events/${item.id_fair}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    {item.event_name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.location}</td>
                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                  {item.start_date} — {item.end_date}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.region}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EventsTable;
