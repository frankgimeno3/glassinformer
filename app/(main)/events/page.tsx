'use client';

import React, { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ArticleMiniature from '../main_components/ArticleMiniature';
import { ArticleService } from '@/service/ArticleService';
import { EventService } from '@/service/EventService';

interface IndustryEventsProps {}

interface Event {
  id_fair: string;
  event_name: string;
  country: string;
  main_description: string;
  region: string;
  start_date: string;
  end_date: string;
  location: string;
}

const IndustryEvents: FC<IndustryEventsProps> = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'news' | 'calendar'>('calendar');
  const [eventNews, setEventNews] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [calendarInitialized, setCalendarInitialized] = useState(false);
  const [viewMode, setViewMode] = useState<'months' | 'day'>('months');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    fetchEventNews();
    fetchEvents();
  }, []);

  // Update calendar month when events are loaded (only once)
  useEffect(() => {
    if (events.length > 0 && !calendarInitialized) {
      const sortedEvents = [...events].sort((a, b) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
      const firstEventDate = new Date(sortedEvents[0].start_date);
      const initialMonth = new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), 1);
      console.log('Initializing calendar to:', initialMonth, 'for event:', sortedEvents[0].event_name);
      setCurrentMonth(initialMonth);
      setCalendarInitialized(true);
    }
  }, [events, calendarInitialized]);

  const fetchEventNews = async () => {
    try {
      const articles = await ArticleService.getAllArticles();
      const filtered = articles
        .filter((article: any) => article.isEventNews === true)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.date || 0).getTime();
          const dateB = new Date(b.date || 0).getTime();
          return dateB - dateA; // Most recent first
        });
      setEventNews(filtered);
    } catch (error) {
      console.error('Error fetching event news:', error);
      setEventNews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const eventsData = await EventService.getAllEvents();
      console.log('Fetched events:', eventsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      // When navigating, we shift by one month
      // The left month becomes the right, and a new month appears
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    if (events.length === 0) return [];
    
    // Normalize date to YYYY-MM-DD format for comparison
    // Use UTC methods to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return events.filter((event) => {
      if (!event.start_date || !event.end_date) return false;
      // Parse dates without time to avoid timezone issues
      const startDateStr = event.start_date.split('T')[0];
      const endDateStr = event.end_date.split('T')[0];
      const isInRange = dateStr >= startDateStr && dateStr <= endDateStr;
      return isInRange;
    });
  };

  const isEventSelected = (eventId: string) => {
    return selectedEventId === eventId;
  };

  const isDateInSelectedEvent = (date: Date) => {
    if (!selectedEventId) return false;
    const selectedEvent = events.find(e => e.id_fair === selectedEventId);
    if (!selectedEvent) return false;
    // Normalize date to YYYY-MM-DD format for comparison
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const startDateStr = selectedEvent.start_date.split('T')[0];
    const endDateStr = selectedEvent.end_date.split('T')[0];
    return dateStr >= startDateStr && dateStr <= endDateStr;
  };

  const getEventDayNumber = (event: Event, date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const startDateStr = event.start_date.split('T')[0];
    const endDateStr = event.end_date.split('T')[0];
    
    if (dateStr < startDateStr || dateStr > endDateStr) return null;
    
    const startDate = new Date(startDateStr);
    const currentDate = new Date(dateStr);
    const diffTime = currentDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const endDate = new Date(endDateStr);
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return { current: diffDays, total: totalDays };
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
    setViewMode('day');
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    if (!selectedDay) return;
    const newDate = new Date(selectedDay);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDay(newDate);
  };

  const renderCalendar = () => {
    // Show two months: current and next
    const month1 = new Date(currentMonth);
    const month2 = new Date(currentMonth);
    month2.setMonth(month2.getMonth() + 1);

    const renderMonth = (month: Date, isLeft: boolean) => {
      const year = month.getFullYear();
      const monthIndex = month.getMonth();
      const firstDay = new Date(year, monthIndex, 1);
      const lastDay = new Date(year, monthIndex + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      const days = [];
      // Empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }

      const weeks = [];
      for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
      }

      return (
        <div className="flex flex-col">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">
              {monthNames[monthIndex]} {year}
            </h3>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-600 py-1">
                {day}
              </div>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => {
                if (day === null) {
                  return <div key={dayIndex} className="aspect-square"></div>;
                }
                const date = new Date(year, monthIndex, day);
                const dayEvents = getEventsForDate(date);
                const hasEvents = dayEvents.length > 0;
                const isSelected = isDateInSelectedEvent(date);
                // Get event names to display
                const eventNames = hasEvents 
                  ? dayEvents.map(e => e.event_name)
                  : [];
                
                return (
                  <div
                    key={dayIndex}
                    onClick={() => handleDayClick(date)}
                    className={`aspect-square border rounded p-1 text-xs flex flex-col relative cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'bg-blue-900 border-blue-900 text-white'
                        : hasEvents
                        ? 'bg-blue-50 border-blue-300'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="font-medium">{day}</div>
                    {hasEvents && (
                      <div className="flex-1 flex flex-col justify-start mt-1 overflow-hidden">
                        {eventNames.slice(0, 2).map((name, idx) => (
                          <div
                            key={idx}
                            className={`text-[8px] leading-tight truncate ${
                              isSelected ? 'text-blue-200' : 'text-blue-600'
                            }`}
                            title={name}
                          >
                            {name}
                          </div>
                        ))}
                        {eventNames.length > 2 && (
                          <div className={`text-[8px] ${
                            isSelected ? 'text-blue-200' : 'text-blue-600'
                          }`}>
                            +{eventNames.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              ←
            </button>
            <span className="text-sm text-gray-600">Move Left</span>
          </div>
          {renderMonth(month1, true)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Move Right</span>
            <button
              onClick={() => navigateMonth('next')}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              →
            </button>
          </div>
          {renderMonth(month2, false)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Industry Events</h1>

      {/* Tabs */}
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

      {/* Tab Content */}
      {activeTab === 'news' && (
        <div>
          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-500">Loading event news...</p>
            </div>
          ) : eventNews.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No event news available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventNews.map((article) => (
                <div
                  key={article.id_article}
                  onClick={() => router.push(`/articles/${article.id_article}`)}
                  className="cursor-pointer"
                >
                  <ArticleMiniature
                    id_article={article.id_article}
                    titulo={article.articleTitle}
                    date={article.date}
                    imageUrl={article.article_main_image_url}
                  />
                  {/* Additional info for event news */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {article.article_countries_array && article.article_countries_array.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Countries: </span>
                        {article.article_countries_array.join(', ')}
                      </div>
                    )}
                    {article.article_region && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Region: </span>
                        {article.article_region}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <>
          {viewMode === 'months' ? (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Calendar on the left */}
              <div className="lg:w-2/3">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  {renderCalendar()}
                </div>
              </div>

              {/* Events List on the right */}
              <div className="lg:w-1/3">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
                <div className="space-y-4">
                  {events.length === 0 ? (
                    <p className="text-gray-500">No events available</p>
                  ) : (
                    events
                      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                      .map((event) => {
                        const isSelected = isEventSelected(event.id_fair);
                        return (
                          <div
                            key={event.id_fair}
                            onClick={() => setSelectedEventId(event.id_fair)}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-900 border-blue-900 text-white shadow-lg'
                                : 'border-gray-200 hover:shadow-md'
                            }`}
                          >
                            <h3 
                              className={`font-semibold text-lg mb-2 transition-colors ${
                                isSelected ? 'text-white' : 'text-gray-900'
                              }`}
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.color = '#2563eb';
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.color = '#111827';
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/events/${event.id_fair}`);
                              }}
                            >
                              {event.event_name}
                            </h3>
                            <p className={`text-sm mb-2 ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
                              {event.main_description}
                            </p>
                            <div className={`text-xs space-y-1 ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                              <div>
                                <span className="font-medium">Location: </span>
                                {event.location}
                              </div>
                              <div>
                                <span className="font-medium">Date: </span>
                                {new Date(event.start_date).toLocaleDateString()}
                                {event.start_date !== event.end_date && (
                                  <> - {new Date(event.end_date).toLocaleDateString()}</>
                                )}
                              </div>
                              <div>
                                <span className="font-medium">Region: </span>
                                {event.region}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Back button */}
              <button
                onClick={() => {
                  setViewMode('months');
                  setSelectedDay(null);
                }}
                className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm self-start"
              >
                ← Back to Calendar
              </button>

              {/* Day view */}
              {selectedDay && (
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => navigateDay('prev')}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                      ← Previous Day
                    </button>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">
                        {selectedDay.getDate()}
                      </div>
                      <div className="text-xl text-gray-600 capitalize">
                        {selectedDay.toLocaleDateString('en-US', { weekday: 'long' })}
                      </div>
                      <div className="text-lg text-gray-500 capitalize">
                        {selectedDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <button
                      onClick={() => navigateDay('next')}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                      Next Day →
                    </button>
                  </div>

                  {/* Events list for the day */}
                  <div className="mt-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Events</h3>
                    {getEventsForDate(selectedDay).length === 0 ? (
                      <p className="text-gray-500">No events scheduled for this day</p>
                    ) : (
                      <div className="space-y-4">
                        {getEventsForDate(selectedDay).map((event) => {
                          const dayInfo = getEventDayNumber(event, selectedDay);
                          return (
                            <div
                              key={event.id_fair}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <h4
                                className="font-semibold text-lg text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => router.push(`/events/${event.id_fair}`)}
                              >
                                {event.event_name}
                                {dayInfo && (
                                  <span className="ml-2 text-sm text-gray-500">
                                    ({dayInfo.current}/{dayInfo.total})
                                  </span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">{event.main_description}</p>
                              <div className="text-xs text-gray-500 space-y-1">
                                <div>
                                  <span className="font-medium">Location: </span>
                                  {event.location}
                                </div>
                                <div>
                                  <span className="font-medium">Date: </span>
                                  {new Date(event.start_date).toLocaleDateString()}
                                  {event.start_date !== event.end_date && (
                                    <> - {new Date(event.end_date).toLocaleDateString()}</>
                                  )}
                                </div>
                                <div>
                                  <span className="font-medium">Region: </span>
                                  {event.region}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IndustryEvents;
