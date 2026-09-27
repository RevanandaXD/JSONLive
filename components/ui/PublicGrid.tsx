"use client";

import { useMemo, useState } from "react";
import { FiSearch, FiFolder, FiX } from "react-icons/fi";
import { PublicCopyButton } from "@/components/ui/PublicCopyButton";

export type PublicRow = {
  id: string;
  name: string;
  slug: string;
  username: string;
  type: "collection" | "object";
  endpoint: string;
};

export function PublicGrid({ rows }: { rows: PublicRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        r.username.toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <section>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full rounded-md border border-border/60 bg-card/60 py-2.5 pl-10 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {rows.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <FiFolder className="h-6 w-6" />
          </div>
          <h3 className="mb-1 font-heading text-lg font-semibold">
            {rows.length === 0
              ? "No published APIs yet"
              : "No results for this search"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {rows.length === 0
              ? "Log in and publish your first resource, and its endpoint will show up here."
              : "Try a different keyword."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((row) => (
            <div
              key={row.id}
              className="group flex flex-col rounded-md border border-border/70 bg-card/60 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-card"
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-heading font-semibold leading-tight text-foreground">
                    {row.name}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    @{row.username}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold ${
                    row.type === "collection"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {row.type === "collection" ? "Collection" : "Object"}
                </span>
              </div>

              {/* Endpoint */}
              <a
                href={row.endpoint}
                target="_blank"
                rel="noopener noreferrer"
                title={row.endpoint}
                className="mb-3 flex min-w-0 flex-1 items-center gap-2 rounded border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="truncate">{row.endpoint}</span>
              </a>

              {/* Footer */}
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                <span className="text-[11px] text-muted-foreground/70">
                  Public endpoint
                </span>
                <PublicCopyButton endpoint={row.endpoint} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}