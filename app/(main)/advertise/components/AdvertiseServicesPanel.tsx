'use client';

import React, { FC } from 'react';
import type { CartPricedItem, MediakitCatalogRow } from '../types';
import AddToCartButton from './AddToCartButton';

interface AdvertiseServicesPanelProps {
  items: MediakitCatalogRow[];
  pricedItems: CartPricedItem[];
  onAddPriced: (item: CartPricedItem) => void;
  onRemovePriced: (id: string) => void;
}

const AdvertiseServicesPanel: FC<AdvertiseServicesPanelProps> = ({
  items,
  pricedItems,
  onAddPriced,
  onRemovePriced,
}) => {
  const isPriced = (id: string) => pricedItems.some((i) => i.id === id);

  const toggle = (row: MediakitCatalogRow) => {
    const id = row.service_id;
    if (isPriced(id)) {
      onRemovePriced(id);
      return;
    }
    onAddPriced({
      id,
      label: row.service_full_name,
      priceUsd: row.service_unit_price,
      quantity: 1,
    });
  };

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 text-center text-sm text-gray-600">
        No catalog items in this category for this portal yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((row) => {
        const price = row.service_unit_price;
        const priceLabel =
          price > 0
            ? `${price.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD`
            : 'Contact for pricing';
        return (
          <li
            key={row.service_id}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex-1">
              <h3 className="text-base font-semibold leading-snug text-gray-900">{row.service_full_name}</h3>
              {row.service_group_name && (
                <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">{row.service_group_name.replace(/_/g, ' ')}</p>
              )}
              <p className="mt-3 text-sm font-medium text-blue-950">{priceLabel}</p>
            </div>
            <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
              <AddToCartButton
                selected={isPriced(row.service_id)}
                onToggle={() => toggle(row)}
                ariaLabel={isPriced(row.service_id) ? 'Remove from cart' : 'Add to cart'}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default AdvertiseServicesPanel;
