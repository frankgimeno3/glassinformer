import ArticleHtmlBlock from "./ArticleHtmlBlock";

export interface ContentItem {
  content_id: string;
  content_type: string;
  content_content?: {
    center?: string;
    left?: string;
    right?: string;
  };
}

interface ArticleContentBlockProps {
  contentId: string;
  contentData: ContentItem | undefined;
}

export default function ArticleContentBlock({ contentId, contentData }: ArticleContentBlockProps) {
  if (!contentData) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        ❌ Content not found: {contentId}
      </div>
    );
  }

  const { content_type, content_content } = contentData;

  if (content_type === "just_text") {
    return (
      <div className="w-full flex justify-start">
        <ArticleHtmlBlock html={content_content?.center} />
      </div>
    );
  }

  if (content_type === "just_image") {
    return (
      <div className="w-full flex justify-start">
        <img
          src={content_content?.center}
          alt="content image"
          className="w-full max-w-4xl rounded-lg object-contain"
        />
      </div>
    );
  }

  if (content_type === "text_image") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="min-w-0">
          <ArticleHtmlBlock html={content_content?.left} />
        </div>
        <img
          src={content_content?.right}
          alt="content image"
          className="w-full max-w-2xl rounded-lg object-contain"
        />
      </div>
    );
  }

  if (content_type === "image_text") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <img
          src={content_content?.left}
          alt="content image"
          className="w-full max-w-2xl rounded-lg object-contain"
        />
        <div className="min-w-0">
          <ArticleHtmlBlock html={content_content?.right} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
      ⚠ Unknown content type: {content_type}
    </div>
  );
}
