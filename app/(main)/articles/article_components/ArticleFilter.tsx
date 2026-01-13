"use client";

import { FC } from "react";

interface ArticleFilterProps {}

const ArticleFilter: FC<ArticleFilterProps> = ({}) => {
  // Simple filter component - can be enhanced later
  return (
    <div className="px-36 mx-7">
      <div className="flex flex-col border border-gray-100 shadow-xl text-center py-2 text-xs">
        <p>Filter articles (coming soon)</p>
      </div>
    </div>
  );
};

export default ArticleFilter;

