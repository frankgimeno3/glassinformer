interface ArticleHeroProps {
  imageUrl: string;
  alt: string;
}

export default function ArticleHero({ imageUrl, alt }: ArticleHeroProps) {
  return (
    <img
      src={imageUrl}
      alt={alt}
      className="w-full rounded-none shadow-md object-cover max-h-[50vh]"
    />
  );
}
