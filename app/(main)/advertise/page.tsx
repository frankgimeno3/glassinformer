'use client';

import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import type { TabId } from './types';
import type { CartPricedItem, MediakitCatalogRow } from './types';
import MediakitIntro from './components/MediakitIntro';
import MediakitTabs from './components/MediakitTabs';
import MediakitCart from './components/MediakitCart';
import MediakitContact from './components/MediakitContact';
import AdvertiseServicesPanel from './components/AdvertiseServicesPanel';
import MagazineServicesAccordion from './components/MagazineServicesAccordion';

export default function AdvertisePage() {
  const contactFormRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabId>('portal');
  const [pricedItems, setPricedItems] = useState<CartPricedItem[]>([]);
  const [cartBlinkTrigger, setCartBlinkTrigger] = useState(0);
  const [catalog, setCatalog] = useState<MediakitCatalogRow[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCatalogLoading(true);
      setCatalogError(null);
      try {
        const res = await fetch('/api/v1/mediakit-services', { credentials: 'same-origin' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as MediakitCatalogRow[];
        if (!cancelled) {
          setCatalog(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!cancelled) {
          setCatalogError(e instanceof Error ? e.message : 'Could not load catalog');
          setCatalog([]);
        }
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const portalItems = useMemo(
    () => catalog.filter((s) => s.service_group_channel === 'portal'),
    [catalog]
  );
  const magazineItems = useMemo(
    () => catalog.filter((s) => s.service_group_channel === 'magazine'),
    [catalog]
  );
  const demItems = useMemo(() => catalog.filter((s) => s.service_group_channel === 'dem'), [catalog]);

  const scrollToContact = useCallback(() => {
    contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const addPriced = useCallback((item: CartPricedItem) => {
    setPricedItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, { ...item, quantity: item.quantity ?? 1 }];
    });
  }, []);

  const removePriced = useCallback((id: string) => {
    setPricedItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <h1 className="pb-4 text-center text-4xl font-bold text-gray-900 sm:text-5xl">Advertise</h1>

      <MediakitIntro onCartBelowClick={() => setCartBlinkTrigger((t) => t + 1)} />

      <MediakitCart
        pricedItems={pricedItems}
        pendingItems={[]}
        onContactSales={scrollToContact}
        onRemovePriced={removePriced}
        blinkTrigger={cartBlinkTrigger}
      />

      <MediakitTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mx-auto max-w-4xl">
        {catalogLoading && (
          <p className="py-12 text-center text-sm text-gray-600">Loading catalog…</p>
        )}
        {!catalogLoading && catalogError && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
            Catalog could not be loaded ({catalogError}). If this persists, ensure migration 090 has been applied on the database.
          </p>
        )}
        {!catalogLoading && !catalogError && (
          <>
            {activeTab === 'portal' && (
              <AdvertiseServicesPanel
                items={portalItems}
                pricedItems={pricedItems}
                onAddPriced={addPriced}
                onRemovePriced={removePriced}
              />
            )}
            {activeTab === 'magazine' && (
              <MagazineServicesAccordion
                items={magazineItems}
                pricedItems={pricedItems}
                onAddPriced={addPriced}
                onRemovePriced={removePriced}
              />
            )}
            {activeTab === 'dem' && (
              <AdvertiseServicesPanel
                items={demItems}
                pricedItems={pricedItems}
                onAddPriced={addPriced}
                onRemovePriced={removePriced}
              />
            )}
          </>
        )}
      </div>

      <MediakitContact contactRef={contactFormRef} pricedItems={pricedItems} />
    </div>
  );
}
