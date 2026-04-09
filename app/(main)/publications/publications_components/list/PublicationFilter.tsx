"use client";

import { FC, useCallback } from "react";

export interface PublicationFilterState {
  number: string;
  month: string;
  year: string;
  dateFrom: string;
  dateTo: string;
}

interface PublicationFilterProps {
  filter: PublicationFilterState;
  onFilterChange: (filter: PublicationFilterState) => void;
  availableNumbers: number[];
  availableYears: number[];
}

const MONTHS = [
  { value: "", label: "All months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const PublicationFilter: FC<PublicationFilterProps> = ({
  filter,
  onFilterChange,
  availableNumbers,
  availableYears,
}) => {
  const update = useCallback(
    (field: keyof PublicationFilterState, value: string) => {
      onFilterChange({ ...filter, [field]: value });
    },
    [filter, onFilterChange]
  );

  return (
    <div className="w-full max-w-5xl mx-auto mb-8 p-4 sm:p-6 bg-white/80 rounded-xl border border-gray-200 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter publications</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Number (213, 212, 211...) */}
        <div>
          <label htmlFor="filter-number" className="block text-sm font-medium text-gray-700 mb-1">
            Number
          </label>
          <select
            id="filter-number"
            value={filter.number}
            onChange={(e) => update("number", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All</option>
            {availableNumbers.map((num) => (
              <option key={num} value={String(num)}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div>
          <label htmlFor="filter-month" className="block text-sm font-medium text-gray-700 mb-1">
            Month
          </label>
          <select
            id="filter-month"
            value={filter.month}
            onChange={(e) => update("month", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {MONTHS.map((m) => (
              <option key={m.value || "all"} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label htmlFor="filter-year" className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <select
            id="filter-year"
            value={filter.year}
            onChange={(e) => update("year", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All</option>
            {availableYears.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div>
          <label htmlFor="filter-dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
            From
          </label>
          <input
            id="filter-dateFrom"
            type="date"
            value={filter.dateFrom}
            onChange={(e) => update("dateFrom", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Date to */}
        <div>
          <label htmlFor="filter-dateTo" className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <input
            id="filter-dateTo"
            type="date"
            value={filter.dateTo}
            onChange={(e) => update("dateTo", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default PublicationFilter;
