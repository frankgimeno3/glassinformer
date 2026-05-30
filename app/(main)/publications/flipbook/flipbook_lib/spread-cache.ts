import type { SpreadViewData } from "./slotTypes";

export type { SpreadViewData };

export interface SpreadPayload {
  viewData: SpreadViewData;
  prevSpreadLabel: string | null;
  nextSpreadLabel: string | null;
  spreadLabel: string;
  currentPosition: number;
  totalSteps: number;
}

const cache = new Map<string, SpreadPayload>();
const inflight = new Map<string, Promise<SpreadPayload>>();

function key(publicationId: string, label: string) {
  return `${publicationId}\0${label}`;
}

export function getCachedSpread(
  publicationId: string,
  label: string
): SpreadPayload | undefined {
  return cache.get(key(publicationId, label));
}

export function setCachedSpread(
  publicationId: string,
  label: string,
  payload: SpreadPayload
): void {
  cache.set(key(publicationId, label), payload);
}

export function fetchAndCacheSpread(
  publicationId: string,
  label: string
): Promise<SpreadPayload> {
  const existing = getCachedSpread(publicationId, label);
  if (existing) return Promise.resolve(existing);

  const cacheKey = key(publicationId, label);
  const pending = inflight.get(cacheKey);
  if (pending) return pending;

  const request = fetch(
    `/api/flipbook/spread/${encodeURIComponent(publicationId)}/${encodeURIComponent(label)}`
  )
    .then((res) => {
      if (!res.ok) throw new Error("Spread fetch failed");
      return res.json() as Promise<SpreadPayload>;
    })
    .then((payload) => {
      setCachedSpread(publicationId, label, payload);
      inflight.delete(cacheKey);
      return payload;
    })
    .catch((error) => {
      inflight.delete(cacheKey);
      throw error;
    });

  inflight.set(cacheKey, request);
  return request;
}
