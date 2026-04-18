'use client';

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ContentPreferenceService } from '@/app/service/ContentPreferenceService';

type PreferenceState = 'neutral' | 'not interested' | 'very interested';

interface TopicPreferenceRow {
  topic_id: number;
  topic_name: string;
  topic_description: string;
  user_feed_preference_id: string | null;
  preference_state: PreferenceState;
}

function normalizeRow(raw: unknown): TopicPreferenceRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const topic_id = Number(o.topic_id);
  if (!Number.isFinite(topic_id)) return null;
  const ps = o.preference_state;
  const preference_state: PreferenceState =
    ps === 'not interested' || ps === 'very interested' || ps === 'neutral' ? ps : 'neutral';
  return {
    topic_id,
    topic_name: typeof o.topic_name === 'string' ? o.topic_name : String(o.topic_name ?? ''),
    topic_description:
      typeof o.topic_description === 'string' ? o.topic_description : String(o.topic_description ?? ''),
    user_feed_preference_id:
      o.user_feed_preference_id != null ? String(o.user_feed_preference_id) : null,
    preference_state,
  };
}

function rank(value: PreferenceState) {
  if (value === 'very interested') return 0;
  if (value === 'neutral') return 1;
  return 2;
}

function buttonClass(value: PreferenceState, selected: boolean) {
  const base =
    'h-10 w-full rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-950/20 disabled:opacity-50 disabled:cursor-not-allowed';
  if (selected) {
    if (value === 'not interested') return `${base} border-red-600 bg-red-600 text-white`;
    if (value === 'very interested') return `${base} border-green-600 bg-green-600 text-white`;
    return `${base} border-blue-950 bg-blue-950 text-white`;
  }
  if (value === 'not interested')
    return `${base} border-gray-200 bg-white text-gray-800 hover:border-red-300 hover:bg-red-50`;
  if (value === 'very interested')
    return `${base} border-gray-200 bg-white text-gray-800 hover:border-green-300 hover:bg-green-50`;
  return `${base} border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50`;
}

const ContentPreferences: FC = () => {
  const [rows, setRows] = useState<TopicPreferenceRow[]>([]);
  const [orderIds, setOrderIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingTopicId, setSavingTopicId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const list = await ContentPreferenceService.list();
      const parsed = (Array.isArray(list) ? list : []).map(normalizeRow).filter(Boolean) as TopicPreferenceRow[];
      setRows(parsed);
      const sorted = [...parsed].sort((a, b) => {
        const ra = rank(a.preference_state);
        const rb = rank(b.preference_state);
        if (ra !== rb) return ra - rb;
        return a.topic_name.localeCompare(b.topic_name);
      });
      setOrderIds(sorted.map((r) => r.topic_id));
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message?: string }).message)
          : 'Could not load preferences';
      setLoadError(msg);
      setRows([]);
      setOrderIds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byId = useMemo(() => new Map(rows.map((r) => [r.topic_id, r])), [rows]);

  const setTopicPreference = async (topicId: number, next: PreferenceState) => {
    const current = byId.get(topicId)?.preference_state;
    if (current === next) return;
    setSaveError(null);
    setSavingTopicId(topicId);
    try {
      await ContentPreferenceService.update(topicId, next);
      setRows((prev) =>
        prev.map((r) => (r.topic_id === topicId ? { ...r, preference_state: next } : r))
      );
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message?: string }).message)
          : 'Could not save preference';
      setSaveError(msg);
    } finally {
      setSavingTopicId(null);
    }
  };

  return (
    <div className="bg-white min-h-[60vh] rounded-lg shadow p-6 md:p-8">
      <Link
        href="/logged/settings"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 hover:underline cursor-pointer mb-6"
      >
        ← Back to settings
      </Link>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Content preferences</h1>
      <p className="text-gray-600 text-sm mb-8">
        These preferences apply to the Glassinformer portal feed. Use them to prioritize what you read and tailor
        your feed to your interests. They are stored in your account (database), not in this browser.
      </p>

      {loadError ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{loadError}</p>
      ) : null}
      {saveError ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {saveError}
        </p>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Content topics</div>
          <div className="hidden md:block text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
            Not interested
          </div>
          <div className="hidden md:block text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
            Neutral
          </div>
          <div className="hidden md:block text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
            Very interested
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">Loading your preferences…</div>
          ) : orderIds.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No topics are configured for this portal yet.
            </div>
          ) : (
            orderIds.map((id) => {
              const row = byId.get(id);
              if (!row) return null;
              const value = row.preference_state;
              const busy = savingTopicId === row.topic_id;
              return (
                <div
                  key={row.topic_id}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 px-4 py-4 items-center"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{row.topic_name}</p>
                    <p className="mt-1 text-xs text-gray-500 md:hidden">Topic interest</p>
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setTopicPreference(row.topic_id, 'not interested')}
                    className={buttonClass('not interested', value === 'not interested')}
                  >
                    Not interested
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setTopicPreference(row.topic_id, 'neutral')}
                    className={buttonClass('neutral', value === 'neutral')}
                  >
                    Neutral
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setTopicPreference(row.topic_id, 'very interested')}
                    className={buttonClass('very interested', value === 'very interested')}
                  >
                    Very interested
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Changes are saved to the database when you tap an option. The list order is set when you open this page (reload
        to re-sort by interest).
      </p>
    </div>
  );
};

export default ContentPreferences;
