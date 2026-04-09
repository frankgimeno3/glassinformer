import Image from "next/image";
import { canOptimizeRemoteImageSrc } from "@/app/lib/remoteImage";
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
    const src = content_content?.center ?? "";
    if (!src) return null;
    return (
      <div className="w-full flex justify-start">
        <Image
          src={src}
          alt="content image"
          width={1200}
          height={800}
          className="w-full max-w-4xl h-auto rounded-lg object-contain"
          sizes="(max-width: 896px) 100vw, 896px"
          unoptimized={!canOptimizeRemoteImageSrc(src)}
        />
      </div>
    );
  }

  if (content_type === "text_image") {
    const src = content_content?.right ?? "";
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="min-w-0">
          <ArticleHtmlBlock html={content_content?.left} />
        </div>
        {src ? (
          <Image
            src={src}
            alt="content image"
            width={800}
            height={600}
            className="w-full max-w-2xl h-auto rounded-lg object-contain"
            sizes="(max-width: 768px) 100vw, 42vw"
            unoptimized={!canOptimizeRemoteImageSrc(src)}
          />
        ) : null}
      </div>
    );
  }

  if (content_type === "image_text") {
    const src = content_content?.left ?? "";
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {src ? (
          <Image
            src={src}
            alt="content image"
            width={800}
            height={600}
            className="w-full max-w-2xl h-auto rounded-lg object-contain"
            sizes="(max-width: 768px) 100vw, 42vw"
            unoptimized={!canOptimizeRemoteImageSrc(src)}
          />
        ) : null}
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
