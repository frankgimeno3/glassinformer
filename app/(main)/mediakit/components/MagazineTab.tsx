'use client';

import React, { FC, useState } from 'react';
import type { CartPricedItem, CartPendingItem } from '../types';
import AddToCartButton from './AddToCartButton';
import magazinesData from '../../../contents/magazinesAvailable.json';

type MagazineIssue = { magazineNumber: string; isCoverUnavailable: boolean };
type MagazineEntry = { magazineName: string; issues: MagazineIssue[] };

const MAGAZINES = magazinesData as MagazineEntry[];

const OPTIONS = [
  { key: 'single', label: 'Single page advertisement', priceUsd: 800, tooltip: 'One full page in the magazine.' },
  { key: 'double', label: 'Double page advertisement', priceUsd: 1400, tooltip: 'Two facing pages (spread) in the magazine.' },
  { key: 'advertorial', label: 'Advertorial', priceUsd: 800, tooltip: 'Editorial-style paid content, one page.' },
  { key: 'cover', label: 'Cover page', priceUsd: 3000, tooltip: 'Front or back cover placement (limited availability).', onlyWhenCoverAvailable: true },
] as const;

function slug(s: string) {
  return s.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
}

function magazineItemId(magazineName: string, magazineNumber: string, optionKey: string) {
  return `magazine-${slug(magazineName)}-${slug(magazineNumber)}-${optionKey}`;
}

interface MagazineTabProps {
  pricedItems: CartPricedItem[];
  onAddPriced: (item: CartPricedItem) => void;
  onRemovePriced: (id: string) => void;
}

const InfoTooltip: FC<{ text: string }> = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold cursor-help">
        i
      </div>
      {show && (
        <div className="absolute left-full ml-1 top-1/2 -translate-y-1/2 z-10 px-2 py-1.5 bg-gray-900 text-white text-xs rounded shadow-lg max-w-[200px] whitespace-normal">
          {text}
        </div>
      )}
    </div>
  );
};

const MagazineTab: FC<MagazineTabProps> = ({ pricedItems, onAddPriced, onRemovePriced }) => {
  const [expandedMagazine, setExpandedMagazine] = useState<number | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<{ magIndex: number; issueIndex: number } | null>(null);

  const isPriced = (id: string) => pricedItems.some((i) => i.id === id);

  const selectedMagazine = selectedIssue != null ? MAGAZINES[selectedIssue.magIndex] : null;
  const selectedIssueData = selectedIssue != null && selectedMagazine ? selectedMagazine.issues[selectedIssue.issueIndex] : null;

  const toggleMagazine = (index: number) => {
    setExpandedMagazine((prev) => (prev === index ? null : index));
    setSelectedIssue(null);
  };

  const selectIssue = (magIndex: number, issueIndex: number) => {
    setSelectedIssue((prev) =>
      prev?.magIndex === magIndex && prev?.issueIndex === issueIndex
        ? null
        : { magIndex, issueIndex }
    );
  };

  const toggleOption = (magazineName: string, magazineNumber: string, optionKey: string, label: string, priceUsd: number) => {
    const id = magazineItemId(magazineName, magazineNumber, optionKey);
    if (isPriced(id)) onRemovePriced(id);
    else onAddPriced({ id, label, priceUsd });
  };

  return (
    <div className="space-y-4">
      {MAGAZINES.map((mag, magIndex) => (
        <div key={mag.magazineName} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => toggleMagazine(magIndex)}
            className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 hover:bg-gray-50"
          >
            <span>{mag.magazineName}</span>
            <span className="text-gray-500">{expandedMagazine === magIndex ? '▼' : '▶'}</span>
          </button>
          {expandedMagazine === magIndex && (
            <div className="border-t border-gray-100 p-4 space-y-2 bg-gray-50/50">
              <p className="text-sm font-medium text-gray-700 mb-2">Available issues</p>
              <div className="flex flex-wrap gap-2">
                {mag.issues.map((issue, issueIndex) => (
                  <button
                    key={issue.magazineNumber}
                    type="button"
                    onClick={() => selectIssue(magIndex, issueIndex)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedIssue?.magIndex === magIndex && selectedIssue?.issueIndex === issueIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {issue.magazineNumber}
                  </button>
                ))}
              </div>

              {selectedIssue?.magIndex === magIndex && selectedIssueData && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Options for {mag.magazineName} – {selectedIssueData.magazineNumber}
                  </p>
                  {OPTIONS.filter((opt) => !opt.onlyWhenCoverAvailable || !selectedIssueData.isCoverUnavailable).map((opt) => {
                    const id = magazineItemId(mag.magazineName, selectedIssueData.magazineNumber, opt.key);
                    const label = `${mag.magazineName} – ${selectedIssueData.magazineNumber} – ${opt.label}`;
                    return (
                      <div
                        key={opt.key}
                        className="flex items-center gap-4 py-2 px-3 bg-white rounded-lg border border-gray-100"
                      >
                        <span className="flex-1 text-gray-900">{opt.label}</span>
                        <span className="font-semibold text-gray-900">{opt.priceUsd.toLocaleString()} USD</span>
                        <InfoTooltip text={opt.tooltip} />
                        <AddToCartButton
                          selected={isPriced(id)}
                          onToggle={() => toggleOption(mag.magazineName, selectedIssueData.magazineNumber, opt.key, label, opt.priceUsd)}
                          ariaLabel={`Add ${opt.label} to cart`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MagazineTab;
