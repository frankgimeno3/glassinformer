interface ArticleHtmlBlockProps {
  html: string | undefined;
  className?: string;
}

export default function ArticleHtmlBlock({ html, className = "article-body max-w-4xl" }: ArticleHtmlBlockProps) {
  if (html == null || html === "") return null;
  const str = typeof html === "string" ? html : String(html);
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: str }}
    />
  );
}
