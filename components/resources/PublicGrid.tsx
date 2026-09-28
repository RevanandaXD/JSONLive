"use client";

import { useMemo, useState } from "react";
import { FiFolder } from "react-icons/fi";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";

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
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name or username..."
          ariaLabel="Search public endpoints"
          className="w-full max-w-md"
        />

        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {rows.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FiFolder}
          title={
            rows.length === 0 ? "No published APIs yet" : "No results for this search"
          }
          description={
            rows.length === 0
              ? "Log in and publish your first resource, and its endpoint will show up here."
              : "Try a different keyword."
          }
        />
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
                <Badge tone={row.type === "collection" ? "sky" : "primary"}>
                  {row.type === "collection" ? "Collection" : "Object"}
                </Badge>
              </div>

              {/* Endpoint */}
              <a
                href={row.endpoint}
                target="_blank"
                rel="noopener noreferrer"
                title={row.endpoint}
                className="mb-3 flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="truncate">{row.endpoint}</span>
              </a>

              {/* Footer */}
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                <span className="text-[11px] text-muted-foreground/70">
                  Public endpoint
                </span>
                <CopyButton
                  value={row.endpoint}
                  ariaLabel={`Copy endpoint for ${row.name}`}
                  className="px-3 py-2"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
