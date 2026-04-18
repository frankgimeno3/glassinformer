'use client';

import React, { FC } from 'react';

interface AddToCartButtonProps {
  selected: boolean;
  onToggle: () => void;
  ariaLabel?: string;
}

const CartIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CheckIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AddToCartButton: FC<AddToCartButtonProps> = ({ selected, onToggle, ariaLabel = 'Add to cart' }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel}
      aria-pressed={selected}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer border border-transparent ${
        selected
          ? 'bg-blue-900 text-white hover:bg-blue-800'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {selected ? <CheckIcon /> : <CartIcon />}
      <span>{selected ? 'Added' : 'Add'}</span>
      <input
        type="checkbox"
        checked={selected}
        readOnly
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />
    </button>
  );
};

export default AddToCartButton;
