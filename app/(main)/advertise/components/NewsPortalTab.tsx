'use client';

import React, { FC, useState } from 'react';
import type { CartPricedItem, CartPendingItem } from '../types';
import AddToCartButton from './AddToCartButton';

const ID_BASIC = 'news-basic-subscription';
const ID_PREMIUM = 'news-premium-subscription';
const ID_TOP_BANNER = 'news-web-top-banner';
const ID_MEDIUM_BANNER = 'news-web-medium-banner';
const ID_RIGHT_BANNER = 'news-web-right-banner';

interface NewsPortalTabProps {
  pricedItems: CartPricedItem[];
  pendingItems: CartPendingItem[];
  onAddPriced: (item: CartPricedItem) => void;
  onRemovePriced: (id: string) => void;
  onAddPending: (item: CartPendingItem) => void;
  onRemovePending: (id: string) => void;
}

const NewsPortalTab: FC<NewsPortalTabProps> = ({
  pricedItems,
  pendingItems,
  onAddPriced,
  onRemovePriced,
  onAddPending,
  onRemovePending,
}) => {
  const [webBannersOpen, setWebBannersOpen] = useState(false);

  const isPriced = (id: string) => pricedItems.some((i) => i.id === id);
  const isPending = (id: string) => pendingItems.some((i) => i.id === id);

  const toggleBasic = () => {
    if (isPriced(ID_BASIC)) onRemovePriced(ID_BASIC);
    else onAddPriced({ id: ID_BASIC, label: 'Basic Company Subscription', priceUsd: 500 });
  };

  const togglePremium = () => {
    if (isPending(ID_PREMIUM)) onRemovePending(ID_PREMIUM);
    else onAddPending({ id: ID_PREMIUM, label: 'Premium Company Subscription' });
  };

  const toggleBanner = (id: string, label: string, price: number) => {
    if (isPriced(id)) onRemovePriced(id);
    else onAddPriced({ id, label, priceUsd: price });
  };

  return (
    <div className="space-y-6">
      {/* Basic Company Subscription */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1">
          <p className="font-medium text-gray-900">Basic Company Subscription</p>
          <p className="text-gray-600 text-sm mt-0.5">500 USD per year</p>
        </div>
        <span className="font-semibold text-gray-900">500 USD/year</span>
        <AddToCartButton
          selected={isPriced(ID_BASIC)}
          onToggle={toggleBasic}
          ariaLabel="Add Basic Company Subscription to cart"
        />
      </div>

      {/* Web banners (expandable) */}
      <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setWebBannersOpen(!webBannersOpen)}
          className="w-full flex items-center justify-between p-4 bg-white text-left font-medium text-gray-900 hover:bg-gray-50"
        >
          <span>Web banners</span>
          <span className="text-gray-500">{webBannersOpen ? '▼' : '▶'}</span>
        </button>
        {webBannersOpen && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-3">
            <div className="flex items-center gap-4">
              <p className="flex-1 text-gray-900">Top Banner</p>
              <span className="font-semibold text-gray-900">1,000 USD</span>
              <AddToCartButton
                selected={isPriced(ID_TOP_BANNER)}
                onToggle={() => toggleBanner(ID_TOP_BANNER, 'Top Banner', 1000)}
                ariaLabel="Add Top Banner to cart"
              />
            </div>
            <div className="flex items-center gap-4">
              <p className="flex-1 text-gray-900">Medium Banner</p>
              <span className="font-semibold text-gray-900">500 USD</span>
              <AddToCartButton
                selected={isPriced(ID_MEDIUM_BANNER)}
                onToggle={() => toggleBanner(ID_MEDIUM_BANNER, 'Medium Banner', 500)}
                ariaLabel="Add Medium Banner to cart"
              />
            </div>
            <div className="flex items-center gap-4">
              <p className="flex-1 text-gray-900">Right Banner</p>
              <span className="font-semibold text-gray-900">750 USD</span>
              <AddToCartButton
                selected={isPriced(ID_RIGHT_BANNER)}
                onToggle={() => toggleBanner(ID_RIGHT_BANNER, 'Right Banner', 750)}
                ariaLabel="Add Right Banner to cart"
              />
            </div>
          </div>
        )}
      </div>

      {/* Premium Company Subscription */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1">
          <p className="font-medium text-gray-900">Premium Company Subscription</p>
          <p className="text-gray-600 text-sm mt-0.5">Pending to quote</p>
        </div>
        <span className="text-gray-500 italic text-sm">Pending to quote</span>
        <AddToCartButton
          selected={isPending(ID_PREMIUM)}
          onToggle={togglePremium}
          ariaLabel="Add Premium Company Subscription to cart"
        />
      </div>
    </div>
  );
};

export default NewsPortalTab;
