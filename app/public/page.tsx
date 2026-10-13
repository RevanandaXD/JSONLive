import prisma from "@/src/lib/prisma";
import { PUBLIC_BASE_URL } from "@/src/lib/config";
import { PublicGrid, type PublicRow } from "@/components/resources/PublicGrid";
import { DashboardNav } from "@/components/layout/DashboardNav";

export const metadata = {
  title: "Public APIs | JSONLive",
  description: "Browse public JSON API endpoints published on JSONLive.",
};

export const dynamic = "force-dynamic";

export default async function PublicPage() {
  const resources = await prisma.resource.findMany({
    where: { published: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      user: {
        select: { username: true },
      },
    },
  });

  const rows: PublicRow[] = resources.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    username: r.user.username ?? "",
    type: Array.isArray(r.data) ? "collection" : "object",
    endpoint: `${PUBLIC_BASE_URL}/api/${r.user.username}/${r.slug}`,
  }));

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardNav loginOnly />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <header className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Explore
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Public APIs
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The endpoints below can be fetched straight from your app — no
            backend, no setup, no authentication.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded border border-border/60 bg-card/60 px-3.5 py-1.5 text-xs font-semibold text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {rows.length} endpoints live
            </span>
          </div>
        </header>

        {/* Grid */}
        <PublicGrid rows={rows} />

      {/* Footer */}
      <footer className="mt-16 border-t border-border/60 pt-6">
        <p className="text-center text-xs text-muted-foreground/70">
          JSONLive — turn JSON into a usable API.
        </p>
      </footer>
      </main>
    </div>
  );
}