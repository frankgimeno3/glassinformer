'use client';

import React, { FC } from 'react';
import { useRouter } from 'next/navigation';

export interface OtherPortalProductCardProps {
  type: 'product';
  item: {
    id_product: string;
    product_name: string;
    product_description?: string;
    company_name?: string;
    main_image_src?: string;
  };
  portalId: number | null;
  onBack: () => void;
}

export interface OtherPortalCompanyCardProps {
  type: 'company';
  item: {
    id_company: string;
    company_name: string;
    country?: string;
    main_description?: string;
  };
  portalId: number | null;
  onBack: () => void;
}

type OtherPortalCardProps = OtherPortalProductCardProps | OtherPortalCompanyCardProps;

const OtherPortalCard: FC<OtherPortalCardProps> = ({ type, item, portalId, onBack }) => {
  const router = useRouter();
  const portalLabel = portalId != null ? `Portal ${portalId}` : 'another portal';

  const handleRedirect = () => {
    if (portalId != null && typeof window !== 'undefined') {
      const portalUrlKey = `NEXT_PUBLIC_PORTAL_${portalId}_URL`;
      const baseUrl = (process.env as Record<string, string>)[portalUrlKey] || window.location.origin;
      const path = type === 'product'
        ? `/directory/products/${(item as OtherPortalProductCardProps['item']).id_product}`
        : `/directory/companies/${(item as OtherPortalCompanyCardProps['item']).id_company}`;
      window.location.href = `${baseUrl}${path}`;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-amber-900 mb-4">
          {type === 'product' ? 'Product' : 'Company'} found in another portal
        </h2>
        <p className="text-amber-800 mb-6">
          We detected a {type} with this ID in {portalLabel}. Would you like to be redirected to it?
        </p>

        <div className="bg-white rounded-lg p-6 border border-amber-100 mb-6">
          {type === 'product' && (
            <>
              <div className="flex gap-4 mb-4">
                {(item as OtherPortalProductCardProps['item']).main_image_src ? (
                  <img
                    src={(item as OtherPortalProductCardProps['item']).main_image_src}
                    alt={(item as OtherPortalProductCardProps['item']).product_name}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                    —
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {(item as OtherPortalProductCardProps['item']).product_name}
                  </h3>
                  {(item as OtherPortalProductCardProps['item']).company_name && (
                    <p className="text-sm text-gray-600">
                      {(item as OtherPortalProductCardProps['item']).company_name}
                    </p>
                  )}
                </div>
              </div>
              {(item as OtherPortalProductCardProps['item']).product_description && (
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {(item as OtherPortalProductCardProps['item']).product_description}
                </p>
              )}
            </>
          )}
          {type === 'company' && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {(item as OtherPortalCompanyCardProps['item']).company_name}
              </h3>
              {(item as OtherPortalCompanyCardProps['item']).country && (
                <p className="text-sm text-gray-600 mb-2">
                  {(item as OtherPortalCompanyCardProps['item']).country}
                </p>
              )}
              {(item as OtherPortalCompanyCardProps['item']).main_description && (
                <p className="text-gray-700 text-sm line-clamp-3">
                  {(item as OtherPortalCompanyCardProps['item']).main_description}
                </p>
              )}
            </>
          )}
          <p className="text-sm font-medium text-amber-700 mt-4">
            Located in: {portalLabel}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-800"
          >
            Stay here
          </button>
          {portalId != null && (
            <button
              onClick={handleRedirect}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Redirect to {portalLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherPortalCard;
