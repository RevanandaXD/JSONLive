export const Skeleton = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header Skeleton */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted/60"></div>
          <div className="h-4 w-48 animate-pulse rounded-md bg-muted/60"></div>
        </div>
        <div className="h-9 w-32 animate-pulse rounded-md bg-muted/60 sm:w-40"></div>
      </div>

      {/* Search Skeleton */}
      <div className="mb-6 max-w-md">
        <div className="h-10 animate-pulse rounded-md border border-border/60 bg-card/40"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-md border border-border/70 bg-card/60 p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-md bg-muted/60"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-1/2 animate-pulse rounded-md bg-muted/60"></div>
                <div className="h-4 w-1/3 animate-pulse rounded-md bg-muted/60"></div>
              </div>
            </div>
            <div className="mb-4 h-9 animate-pulse rounded-md border border-border/60 bg-background/60"></div>
            <div className="mt-auto flex items-center justify-between">
              <div className="h-3 w-24 animate-pulse rounded-md bg-muted/60"></div>
              <div className="flex gap-1.5">
                <div className="h-8 w-8 animate-pulse rounded-md bg-muted/60"></div>
                <div className="h-8 w-8 animate-pulse rounded-md bg-muted/60"></div>
                <div className="h-8 w-8 animate-pulse rounded-md bg-muted/60"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
