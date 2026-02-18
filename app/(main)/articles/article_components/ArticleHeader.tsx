'use client';

function formatArticleDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { dateStyle: "long" });
  } catch {
    return dateStr;
  }
}

export interface ArticleHeaderProps {
  title: string;
  subtitle?: string;
  date?: string | null;
  tags?: string[];
  isOwner: boolean;
  onDeleteClick: () => void;
}

export default function ArticleHeader({
  title,
  subtitle,
  date,
  tags = [],
  isOwner,
  onDeleteClick,
}: ArticleHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <h2 className="text-xl text-gray-500 mt-1">{subtitle}</h2>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        {date && (
          <time className="text-sm text-gray-500" dateTime={date}>
            {formatArticleDate(date)}
          </time>
        )}
        {isOwner && (
          <button
            type="button"
            onClick={onDeleteClick}
            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium"
          >
            Delete article
          </button>
        )}
      </div>
    </div>
  );
}

export function ArticleTags({ tags, onTagClick }: { tags: string[]; onTagClick: (tag: string) => void }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1 bg-gray-200 rounded-full text-sm cursor-pointer hover:bg-gray-200/50"
          onClick={() => onTagClick(tag)}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
