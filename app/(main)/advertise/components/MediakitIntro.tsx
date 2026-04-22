'use client';

import React, { FC } from 'react';

interface MediakitIntroProps {
  onCartBelowClick?: () => void;
}

const MediakitIntro: FC<MediakitIntroProps> = ({ onCartBelowClick }) => {
  return (
    <p className="mx-auto mb-6 max-w-3xl text-justify text-sm leading-6 text-gray-700 sm:text-base">
      Browse what we offer by tab. Whatever you select in each tab will be added to{' '}
      <span
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onCartBelowClick?.()}
        onClick={onCartBelowClick}
        className="cursor-pointer font-bold text-indigo-700 hover:underline"
      >
        the cart below
      </span>
      , where you can see an indicative cost and request a quote. Use the &quot;Add&quot; button on each option to add or remove it from your selection. When you are ready, scroll to the contact section to get in touch with our sales team.
    </p>
  );
};

export default MediakitIntro;
