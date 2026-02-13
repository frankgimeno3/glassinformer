'use client';

import React, { useRef, useCallback, useState } from 'react';
import type { TabId } from './types';
import type { CartPricedItem, CartPendingItem } from './types';
import MediakitIntro from './components/MediakitIntro';
import MediakitTabs from './components/MediakitTabs';
import MediakitCart from './components/MediakitCart';
import MediakitContact from './components/MediakitContact';
import NewsPortalTab from './components/NewsPortalTab';
import MagazineTab from './components/MagazineTab';
import OtherServicesTab from './components/OtherServicesTab';

export default function MediakitPage() {
  const contactFormRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabId>('news-portal');
  const [pricedItems, setPricedItems] = useState<CartPricedItem[]>([]);
  const [pendingItems, setPendingItems] = useState<CartPendingItem[]>([]);
  const [cartBlinkTrigger, setCartBlinkTrigger] = useState(0);

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

  const updatePricedQuantity = useCallback((id: string, quantity: number) => {
    setPricedItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  }, []);

  const addPending = useCallback((item: CartPendingItem) => {
    setPendingItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removePending = useCallback((id: string) => {
    setPendingItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-center text-4xl sm:text-5xl font-bold text-gray-900 pb-4">Mediakit</h1>

      <MediakitIntro onCartBelowClick={() => setCartBlinkTrigger((t) => t + 1)} />

      <MediakitCart
        pricedItems={pricedItems}
        pendingItems={pendingItems}
        onContactSales={scrollToContact}
        blinkTrigger={cartBlinkTrigger}
      />

      <MediakitTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-4xl mx-auto">
        {activeTab === 'news-portal' && (
          <NewsPortalTab
            pricedItems={pricedItems}
            pendingItems={pendingItems}
            onAddPriced={addPriced}
            onRemovePriced={removePriced}
            onAddPending={addPending}
            onRemovePending={removePending}
          />
        )}
        {activeTab === 'magazine' && (
          <MagazineTab
            pricedItems={pricedItems}
            onAddPriced={addPriced}
            onRemovePriced={removePriced}
          />
        )}
        {activeTab === 'other-services' && (
          <OtherServicesTab
            pricedItems={pricedItems}
            pendingItems={pendingItems}
            onAddPriced={addPriced}
            onRemovePriced={removePriced}
            onUpdatePricedQuantity={updatePricedQuantity}
            onAddPending={addPending}
            onRemovePending={removePending}
          />
        )}
      </div>

      <MediakitContact contactRef={contactFormRef} />
    </div>
  );
}
