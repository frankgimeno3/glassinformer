'use client';

import React, { FC, useMemo, useState } from 'react';
import type { CartPricedItem, MediakitCatalogRow } from '../types';
import AdvertiseServicesPanel from './AdvertiseServicesPanel';

type MagazineGroup = {
  key: string;
  magazineId: string;
  magazineName: string;
  items: MediakitCatalogRow[];
};

function parseMagazineId(serviceFullName: string): string | null {
  const m = String(serviceFullName ?? '').match(/(?:^|\s)magazine\s+([A-Za-z0-9_-]+)\s*$/i);
  return m?.[1] ? String(m[1]) : null;
}

function parseMagazineName(serviceFullName: string): string {
  const s = String(serviceFullName ?? '').trim();
  if (!s) return 'Magazine';
  const first = s.split(' — ')[0];
  return first?.trim() || 'Magazine';
}

function groupMagazineItems(items: MediakitCatalogRow[]): MagazineGroup[] {
  const map = new Map<string, MagazineGroup>();
  for (const row of items) {
    const magazineId = parseMagazineId(row.service_full_name) ?? 'magazine';
    const magazineName = parseMagazineName(row.service_full_name);
    const key = `${magazineName}__${magazineId}`;
    const existing = map.get(key);
    if (existing) existing.items.push(row);
    else map.set(key, { key, magazineId, magazineName, items: [row] });
  }
  return Array.from(map.values()).sort((a, b) => {
    const byName = a.magazineName.localeCompare(b.magazineName);
    if (byName !== 0) return byName;
    return a.magazineId.localeCompare(b.magazineId);
  });
}

interface MagazineServicesAccordionProps {
  items: MediakitCatalogRow[];
  pricedItems: CartPricedItem[];
  onAddPriced: (item: CartPricedItem) => void;
  onRemovePriced: (id: string) => void;
}

const MagazineServicesAccordion: FC<MagazineServicesAccordionProps> = ({
  items,
  pricedItems,
  onAddPriced,
  onRemovePriced,
}) => {
  const groups = useMemo(() => groupMagazineItems(items), [items]);
  const [openKey, setOpenKey] = useState<string | null>(groups[0]?.key ?? null);

  if (groups.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 text-center text-sm text-gray-600">
        No magazine services for this portal yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((g) => {
        const isOpen = openKey === g.key;
        return (
          <div key={g.key} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setOpenKey((prev) => (prev === g.key ? null : g.key))}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">{g.magazineName}</p>
                <p className="text-xs text-gray-500">{g.magazineId}</p>
              </div>
              <span className="shrink-0 text-gray-500">{isOpen ? '▼' : '▶'}</span>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                <AdvertiseServicesPanel
                  items={g.items}
                  pricedItems={pricedItems}
                  onAddPriced={onAddPriced}
                  onRemovePriced={onRemovePriced}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MagazineServicesAccordion;

