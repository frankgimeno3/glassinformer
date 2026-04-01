"use client";

function SkeletonCard() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-lg">
      <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-gray-200" />
      <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-100" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-100" />
      <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

export default function PublicationsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="pb-6 text-center text-4xl font-bold text-gray-900 sm:pb-8 sm:text-5xl">
        Publications
      </h1>

      <div className="mx-auto mb-8 w-full max-w-5xl rounded-xl border border-gray-200 bg-white/80 p-4 shadow-md sm:p-6">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`filter-skeleton-${index}`}
              className="h-10 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </div>

      <div className="mx-auto mb-8 flex justify-center">
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={`publication-skeleton-${index}`} />
        ))}
      </div>
    </div>
  );
}
