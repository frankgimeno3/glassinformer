'use client';

import React, { FC } from 'react';

interface MediakitIntroProps {
  onCartBelowClick?: () => void;
}

const MediakitIntro: FC<MediakitIntroProps> = ({ onCartBelowClick }) => {
  return (
    <p className="text-justify text-gray-600 max-w-2xl mx-auto mb-6">
      Browse what we offer by tab. Whatever you select in each tab will be added to{' '}
      <span
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onCartBelowClick?.()}
        onClick={onCartBelowClick}
        className="text-blue-900 font-bold cursor-pointer hover:underline"
      >
        the cart below
      </span>
      , where you can see an indicative cost and request a quote. Use the &quot;Add&quot; button on each option to add or remove it from your selection. When you are ready, scroll to the contact section to get in touch with our sales team.
    </p>
  );
};

export default MediakitIntro;
