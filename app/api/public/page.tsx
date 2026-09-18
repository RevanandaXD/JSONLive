import Link from "next/link";
import prisma from "@/src/lib/prisma";
import { PUBLIC_BASE_URL } from "@/src/lib/config";

export const metadata = { title: "Public APIs - JSONLive" };

export default async function PublicPage() {
  const resources = await prisma.resource.findMany({
    where: { published: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: { user: { select: { username: true } } },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Explore published APIs
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Free access — public endpoints are read-only (GET).
        </p>
      </div>

      {resources.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
          No published APIs yet. Be the first to publish one!
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => {
            const url = `${PUBLIC_BASE_URL}/api/${r.user.username}/${r.slug}`;
            return (
              <div
                key={r.id}
                className="rounded-xl border border-border/70 bg-card/60 p-5"
              >
                <h2 className="truncate font-heading font-semibold">
                  {r.name}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.user.username}/{r.slug}
                </p>
                <Link
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block truncate rounded-lg border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {url}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
