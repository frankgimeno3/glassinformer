"use client";

import { useParams, useRouter } from "next/navigation";
import React, { FC, useEffect, useState } from "react";
import NewsTable from "./searchComponents/NewsTable";
import CompaniesTable from "./searchComponents/CompaniesTable";
import ProductsTable from "./searchComponents/ProductsTable";
import EventsTable from "./searchComponents/EventsTable";

type TabId = "news" | "companies" | "products" | "events";

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const TABS: { id: TabId; label: string }[] = [
  { id: "news", label: "News" },
  { id: "companies", label: "Companies" },
  { id: "products", label: "Products" },
  { id: "events", label: "Events" },
];

const Search: FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = (params?.search_params as string) ?? "";
  const decodedSearch = typeof searchParams === "string" ? decodeURIComponent(searchParams) : "";

  const [activeTab, setActiveTab] = useState<TabId>("news");
  const [searchQuery, setSearchQuery] = useState(decodedSearch || "");
  const [tabsRevealed, setTabsRevealed] = useState(false);

  useEffect(() => {
    setSearchQuery(decodedSearch || "");
  }, [decodedSearch]);

  useEffect(() => {
    setTabsRevealed(true);
  }, []);

  const getTabDelayMs = (index: number) => {
    const totalMs = 1000;
    const transitionMs = 500;
    const maxDelay = Math.max(0, totalMs - transitionMs);
    const visibleCount = Math.max(1, TABS.length);
    if (visibleCount <= 1) return 0;
    const step = maxDelay / (visibleCount - 1);
    return Math.round(Math.min(index, visibleCount - 1) * step);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) router.push(`/search/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-12 py-8">
      <div className="mb-8 flex items-start">
        <form
          onSubmit={handleSearch}
          className="flex w-full items-center overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm sm:max-w-2xl md:max-w-3xl"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={decodedSearch || "Search..."}
            className="w-full border-0 bg-transparent px-4 py-3 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0"
          />
          <button
            type="submit"
            aria-label="Search"
            className="border-l border-gray-300 bg-transparent px-4 py-3 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <SearchIcon />
          </button>
        </form>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1" aria-label="Search result tabs">
          {TABS.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={
                {
                  ["--gi-reveal-delay" as any]: `${getTabDelayMs(idx)}ms`,
                } as React.CSSProperties
              }
              className={[
                "gi-tab-reveal",
                tabsRevealed ? "gi-tab-reveal--visible" : "gi-tab-reveal--hidden",
                `px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`,
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="w-full">
        {activeTab === "news" && <NewsTable searchTerm={decodedSearch} />}
        {activeTab === "companies" && <CompaniesTable searchTerm={decodedSearch} />}
        {activeTab === "products" && <ProductsTable searchTerm={decodedSearch} />}
        {activeTab === "events" && <EventsTable searchTerm={decodedSearch} />}
      </div>
    </div>
  );
};

export default Search;
