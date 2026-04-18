'use client';

import React, { FC, useState, useEffect } from 'react';
import type { CartPricedItem, CartPendingItem } from '../types';

interface MediakitCartProps {
  pricedItems: CartPricedItem[];
  pendingItems: CartPendingItem[];
  onContactSales: () => void;
  blinkTrigger?: number;
}

const CartIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const MediakitCart: FC<MediakitCartProps> = ({ pricedItems, pendingItems, onContactSales, blinkTrigger = 0 }) => {
  const [pricedExpanded, setPricedExpanded] = useState(true);
  const [pendingExpanded, setPendingExpanded] = useState(true);
  const [headerBold, setHeaderBold] = useState(true);

  useEffect(() => {
    if (blinkTrigger === 0) return;
    let step = 0;
    const steps = [false, true, false, true];
    const t = setInterval(() => {
      setHeaderBold(steps[step]);
      step += 1;
      if (step >= steps.length) clearInterval(t);
    }, 180);
    return () => clearInterval(t);
  }, [blinkTrigger]);

  const totalPriced = pricedItems.reduce(
    (sum, item) => sum + (item.priceUsd ?? 0) * (item.quantity ?? 1),
    0
  );
  const hasItems = pricedItems.length > 0 || pendingItems.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="flex items-center justify-center gap-2 p-4 border-b border-gray-100">
        <CartIcon />
        <span className={headerBold ? 'font-bold text-gray-900' : 'font-normal text-gray-900'}>
          Your selection
        </span>
      </div>

      {!hasItems ? (
        <div className="p-6 text-center text-gray-500 text-sm">
          Click &quot;Add&quot; on the options in the tabs below to add elements to the cart.
        </div>
      ) : (
        <>
          <div className="flex flex-col divide-y divide-gray-100">
            <div className="p-4">
              <button
                type="button"
                onClick={() => setPricedExpanded(!pricedExpanded)}
                className="w-full flex items-center justify-between text-left font-medium text-gray-900"
              >
                <span>Estimated total price</span>
                <span className="text-blue-600 font-semibold">
                  {totalPriced > 0 ? `${totalPriced.toLocaleString()} USD` : '—'}
                </span>
              </button>
              {pricedExpanded && pricedItems.length > 0 && (
                <ul className="mt-2 space-y-1.5 pl-1 text-sm text-gray-600">
                  {pricedItems.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.label}
                        {(item.quantity ?? 1) > 1 ? ` × ${item.quantity}` : ''}
                      </span>
                      <span className="font-medium text-gray-900">
                        {((item.priceUsd ?? 0) * (item.quantity ?? 1)).toLocaleString()} USD
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4">
              <button
                type="button"
                onClick={() => setPendingExpanded(!pendingExpanded)}
                className="w-full flex items-center justify-between text-left font-medium text-gray-900"
              >
                <span>Services pending to quote</span>
                <span className="text-gray-500 text-sm">({pendingItems.length})</span>
              </button>
              {pendingExpanded && (
                <ul className="mt-2 space-y-1.5 pl-1 text-sm text-gray-600">
                  {pendingItems.length > 0 ? (
                    pendingItems.map((item) => (
                      <li key={item.id}>{item.label}</li>
                    ))
                  ) : (
                    <li className="text-gray-400">None</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onContactSales}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors"
            >
              Contact sales
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MediakitCart;
