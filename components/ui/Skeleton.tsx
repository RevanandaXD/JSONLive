export const Skeleton = () => {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-7.5 flex justify-start gap-2">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted/60"></div>
      </div>

      {/* Heading Skeleton */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-muted/60"></div>
          <div className="h-4 w-56 animate-pulse rounded-lg bg-muted/60"></div>
        </div>
        <div className="h-10 w-40 animate-pulse rounded-xl bg-muted/60"></div>
      </div>
      {/* Stats Skeleton */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-border/70 bg-card/60 p-5"
          >
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-muted/60"></div>
            <div className="space-y-2">
              <div className="h-6 w-16 animate-pulse rounded-md bg-muted/60"></div>
              <div className="h-4 w-24 animate-pulse rounded-md bg-muted/60"></div>
            </div>
          </div>
        ))}
      </div>
      {/* Search Skeleton */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 flex-1 animate-pulse rounded-xl border border-border/60 bg-card/40"></div>
      </div>
      {/* Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-border/70 bg-card/60 p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-muted/60"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-1/2 animate-pulse rounded-md bg-muted/60"></div>
                <div className="h-4 w-1/3 animate-pulse rounded-md bg-muted/60"></div>
              </div>
            </div>
            <div className="mb-4 h-8 animate-pulse rounded-lg border border-border/60 bg-background/60"></div>
            <div className="mb-5 h-3 w-1/3 animate-pulse rounded-md bg-muted/60"></div>
            <div className="mt-auto flex gap-2">
              <div className="h-8 flex-1 animate-pulse rounded-lg bg-muted/60"></div>
              <div className="h-8 w-12 animate-pulse rounded-lg bg-muted/60"></div>
              <div className="h-8 w-12 animate-pulse rounded-lg bg-muted/60"></div>
              <div className="h-8 w-12 animate-pulse rounded-lg bg-muted/60"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
