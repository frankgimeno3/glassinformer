'use client';

import React, { FC, useCallback } from 'react';
import type { CartPricedItem, CartPendingItem } from '../types';
import AddToCartButton from './AddToCartButton';

const ID_NEWSLETTER = 'other-banner-newsletter';
const ID_COMMUNICATION = 'other-communication-design';

const UNIT_NEWSLETTER_USD = 500;

interface OtherServicesTabProps {
  pricedItems: CartPricedItem[];
  pendingItems: CartPendingItem[];
  onAddPriced: (item: CartPricedItem) => void;
  onRemovePriced: (id: string) => void;
  onUpdatePricedQuantity: (id: string, quantity: number) => void;
  onAddPending: (item: CartPendingItem) => void;
  onRemovePending: (id: string) => void;
}

const OtherServicesTab: FC<OtherServicesTabProps> = ({
  pricedItems,
  pendingItems,
  onAddPriced,
  onRemovePriced,
  onUpdatePricedQuantity,
  onAddPending,
  onRemovePending,
}) => {
  const newsletterItem = pricedItems.find((i) => i.id === ID_NEWSLETTER);
  const quantity = newsletterItem?.quantity ?? 0;
  const isNewsletterSelected = quantity >= 1;
  const isCommunicationSelected = pendingItems.some((i) => i.id === ID_COMMUNICATION);

  const setQuantity = useCallback(
    (value: number) => {
      const q = Math.max(0, Math.floor(value));
      if (q === 0) {
        onRemovePriced(ID_NEWSLETTER);
        return;
      }
      const existing = pricedItems.find((i) => i.id === ID_NEWSLETTER);
      if (existing) onUpdatePricedQuantity(ID_NEWSLETTER, q);
      else onAddPriced({ id: ID_NEWSLETTER, label: 'Banner in newsletter', priceUsd: UNIT_NEWSLETTER_USD, quantity: q });
    },
    [onAddPriced, onRemovePriced, onUpdatePricedQuantity, pricedItems]
  );

  const handleNewsletterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (Number.isNaN(v)) setQuantity(0);
    else setQuantity(v);
  };

  const handleNewsletterStep = (delta: number) => {
    setQuantity(quantity + delta);
  };

  const toggleCommunication = () => {
    if (isCommunicationSelected) onRemovePending(ID_COMMUNICATION);
    else onAddPending({ id: ID_COMMUNICATION, label: 'Communication &/or graphic design' });
  };

  return (
    <div className="space-y-6">
      {/* Banner in newsletter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <p className="font-medium text-gray-900">Banner in newsletter</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm">Quantity:</span>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => handleNewsletterStep(-1)}
              disabled={quantity <= 0}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              step={1}
              value={quantity}
              onChange={handleNewsletterChange}
              onBlur={() => (quantity < 0 ? setQuantity(0) : undefined)}
              className="w-14 h-9 text-center border-0 border-x border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            />
            <button
              type="button"
              onClick={() => handleNewsletterStep(1)}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
            >
              +
            </button>
          </div>
          <span className="text-gray-600 text-sm">× 500 USD</span>
        </div>
        {isNewsletterSelected && (
          <span className="font-semibold text-gray-900">
            {((quantity || 0) * UNIT_NEWSLETTER_USD).toLocaleString()} USD
          </span>
        )}
      </div>

      {/* Communication &/or graphic design */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1">
          <p className="font-medium text-gray-900">Communication &/or graphic design</p>
          <p className="text-gray-600 text-sm mt-0.5">Pending to quote</p>
        </div>
        <span className="text-gray-500 italic text-sm">Pending to quote</span>
        <AddToCartButton
          selected={isCommunicationSelected}
          onToggle={toggleCommunication}
          ariaLabel="Add Communication &/or graphic design to cart"
        />
      </div>
    </div>
  );
};

export default OtherServicesTab;
