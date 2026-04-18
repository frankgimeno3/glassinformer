'use client';

import React, { FC, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { EventService } from '@/apiClient/EventService';

interface EventItem {
  id_fair: string;
  event_name: string;
  location: string;
  start_date: string;
  end_date: string;
  region: string;
}

interface EventsTableProps {
  searchTerm: string;
}

const EventsTable: FC<EventsTableProps> = ({ searchTerm }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await EventService.getAllEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'Error loading events';
        setError(message);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return events;
    return events.filter((item) => {
      const name = (item.event_name ?? '').toLowerCase();
      const location = (item.location ?? '').toLowerCase();
      const region = (item.region ?? '').toLowerCase();
      return name.includes(term) || location.includes(term) || region.includes(term);
    });
  }, [events, searchTerm]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {loading && (
        <div className="px-6 py-4 text-sm text-gray-600">Loading events...</div>
      )}
      {error && (
        <div className="px-6 py-4 text-sm text-red-700 bg-red-50 border-b border-red-200">
          {error}
        </div>
      )}
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
                {loading ? '—' : `No events found for "${searchTerm}"`}
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
