import Link from "next/link";

export const DashboardHeader = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading font-bold tracking-tight"
        >
          <span className="inline-flex items-center justify-center rounded-md bg-primary px-1.5 py-0.5 font-mono text-xs font-black text-background">
            {"{ }"}
          </span>
          <span>JSONLive</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-all duration-200 hover:bg-primary-hover hover:-translate-y-0.5"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
};
