import PageShell from "@/app/general_components/PageShell";

export default function Loading() {
  return (
    <PageShell maxWidthClass="max-w-7xl">
      <div className="animate-pulse">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="mt-6 h-10 w-full rounded bg-gray-100" />
        <div className="mt-6 space-y-3">
          <div className="h-4 w-5/6 rounded bg-gray-200" />
          <div className="h-4 w-4/6 rounded bg-gray-200" />
          <div className="h-4 w-3/6 rounded bg-gray-200" />
        </div>
        <div className="mt-8 h-64 w-full rounded bg-gray-100" />
      </div>
    </PageShell>
  );
}

