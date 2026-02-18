"use client";

import React from "react";
import Link from "next/link";

interface RelatedCard {
  id: string;
  title: string;
  subtitle?: string;
  type: "article" | "product" | "company";
  href: string;
}

const MOCK_RELATED: RelatedCard[] = [
  {
    id: "rel-1",
    title: "Related article example",
    subtitle: "Industry trends 2025",
    type: "article",
    href: "/articles/sample-article-1"
  },
  {
    id: "rel-2",
    title: "Premium glass product",
    subtitle: "Catalog highlight",
    type: "product",
    href: "/directory/products/sample-product-1"
  },
  {
    id: "rel-3",
    title: "Glass Solutions Ltd",
    subtitle: "Company directory",
    type: "company",
    href: "/directory/companies/sample-company-1"
  }
];

const RelatedContent: React.FC = () => {
  return (
    <section className="mt-10 pt-8 border-t border-gray-200 max-w-4xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Related content</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_RELATED.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col p-4 rounded-lg border border-gray-200 bg-gray-50/50 shadow-sm hover:border-blue-950 hover:bg-gray-100/80 transition-colors"
          >
            <span className="text-xs font-medium text-blue-950 uppercase tracking-wide mb-1">
              {item.type}
            </span>
            <span className="font-medium text-gray-800">{item.title}</span>
            {item.subtitle && (
              <span className="text-sm text-gray-500 mt-1">{item.subtitle}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedContent;
