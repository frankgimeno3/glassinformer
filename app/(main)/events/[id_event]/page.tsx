'use client';

import React, { FC, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EventService } from '@/apiClient/EventService';
import EventContactForm from '../EventContactForm';

interface Event {
  id_fair: string;
  event_name: string;
  country: string;
  main_description: string;
  region: string;
  start_date: string;
  end_date: string;
  location: string;
  event_main_image?: string;
}

const IdEvent: FC = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id_event as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await EventService.getEventById(eventId);
        setEvent(eventData);
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err?.message || 'Error loading event');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex flex-col h-full min-h-screen text-gray-600 px-6 py-10 gap-6 items-center justify-center">
        <p className="text-lg">Loading event...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col h-full min-h-screen text-gray-600 px-6 py-10 gap-6 items-center justify-center">
        <p className="text-red-500 text-lg">
          {error || "The event you are looking for doesn't exist."}
        </p>
        <button
          onClick={() => router.push('/events')}
          className="mt-4 px-4 py-2 bg-blue-950 text-white rounded-xl"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDuration = () => {
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-10">
      <button
        onClick={() => router.push('/events')}
        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm self-start"
      >
        ← Back to Events
      </button>

      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-wrap items-start gap-4 mb-6">
          {event.event_main_image && (
            <img
              src={event.event_main_image}
              alt={event.event_name}
              className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg object-cover border border-gray-200"
            />
          )}
          <h1 className="text-4xl font-bold text-gray-900 flex-1 min-w-0">{event.event_name}</h1>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Location</h3>
              <p className="text-lg text-gray-900">{event.location}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Country</h3>
              <p className="text-lg text-gray-900">{event.country}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Start Date</h3>
              <p className="text-lg text-gray-900">{formatDate(event.start_date)}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">End Date</h3>
              <p className="text-lg text-gray-900">{formatDate(event.end_date)}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Duration</h3>
              <p className="text-lg text-gray-900">{getDuration()} day{getDuration() !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Region</h3>
              <p className="text-lg text-gray-900 capitalize">{event.region}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 leading-relaxed">{event.main_description}</p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Details</h2>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-semibold">Event ID:</span> {event.id_fair}</p>
            <p><span className="font-semibold">Event Name:</span> {event.event_name}</p>
            <p><span className="font-semibold">Location:</span> {event.location}</p>
            <p><span className="font-semibold">Country:</span> {event.country}</p>
            <p><span className="font-semibold">Region:</span> <span className="capitalize">{event.region}</span></p>
            <p><span className="font-semibold">Start Date:</span> {formatDate(event.start_date)}</p>
            <p><span className="font-semibold">End Date:</span> {formatDate(event.end_date)}</p>
          </div>
        </div>

        <EventContactForm />
      </div>
    </div>
  );
};

export default IdEvent;
