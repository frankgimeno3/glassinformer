import ArticleContentBlock, { type ContentItem } from "./ArticleContentBlock";

interface ArticleBodyProps {
  contentIds: string[];
  contents: ContentItem[];
}

export default function ArticleBody({ contentIds, contents }: ArticleBodyProps) {
  return (
    <div className="mt-8 flex flex-col gap-8">
      {(contentIds || []).map((contentId) => {
        const contentData = contents.find((c) => c.content_id === contentId);
        return (
          <section key={contentId} className="flex flex-col gap-4">
            <ArticleContentBlock contentId={contentId} contentData={contentData} />
          </section>
        );
      })}
    </div>
  );
}
