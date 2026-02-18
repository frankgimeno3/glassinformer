'use client';

interface ArticleErrorStateProps {
  message: string;
  onBack: () => void;
}

export default function ArticleErrorState({ message, onBack }: ArticleErrorStateProps) {
  return (
    <div className="flex flex-col h-full min-h-screen text-gray-600 px-6 py-10 gap-6 items-center justify-center">
      <p className="text-red-500 text-lg">{message}</p>
      <button
        onClick={onBack}
        className="mt-4 px-4 py-2 bg-blue-950 text-white rounded-xl"
      >
        Back to articles
      </button>
    </div>
  );
}
