"use client";

import { useParams } from "next/navigation";
import React, { FC, useState } from "react";
import NewsTable from "./searchComponents/NewsTable";
import CompaniesTable from "./searchComponents/CompaniesTable";
import ProductsTable from "./searchComponents/ProductsTable";
import EventsTable from "./searchComponents/EventsTable";

type TabId = "news" | "companies" | "products" | "events";

const TABS: { id: TabId; label: string }[] = [
  { id: "news", label: "News" },
  { id: "companies", label: "Companies" },
  { id: "products", label: "Products" },
  { id: "events", label: "Events" },
];

const Search: FC = () => {
  const params = useParams();
  const searchParams = (params?.search_params as string) ?? "";
  const decodedSearch = typeof searchParams === "string" ? decodeURIComponent(searchParams) : "";

  const [activeTab, setActiveTab] = useState<TabId>("news");

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-12 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
        {decodedSearch || "Search"}
      </h1>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1" aria-label="Search result tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
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
