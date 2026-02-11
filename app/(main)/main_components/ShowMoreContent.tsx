"use client";

import { FC } from "react";

interface ShowMoreContentProps {
  hasMore: boolean;
  onShowMore: () => void;
}

const ShowMoreContent: FC<ShowMoreContentProps> = ({ hasMore, onShowMore }) => {
  return (
    <div className="flex flex-col items-center w-full pt-6 pb-4">
      <button
        type="button"
        onClick={onShowMore}
        disabled={!hasMore}
        className="text-sm text-gray-500 uppercase tracking-wider font-sans px-6 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
        aria-label={hasMore ? "Show more content" : "There's no more content to show"}
      >
        {hasMore ? "Show more content" : "There's no more content to show"}
      </button>
    </div>
  );
};

export default ShowMoreContent;
