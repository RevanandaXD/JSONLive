"use client";

import { useMemo, useState } from "react";
import { FiDatabase, FiFolder, FiSearch } from "react-icons/fi";
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
      {/* Search */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 px-4 py-3 transition-colors focus-within:border-primary/50">
          <FiSearch className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari berdasarkan nama resource atau username..."
            className="w-137 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-16 text-center">
          <FiFolder className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="mb-1 font-heading text-lg font-semibold">
            {rows.length === 0
              ? "Belum ada API yang dipublikasikan"
              : "Tidak ada hasil untuk pencarian ini"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {rows.length === 0
              ? "Login dan publish resource pertamamu, maka endpoint-nya akan muncul di halaman ini."
              : "Coba kata kunci lain."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((row) => (
            <div
              key={row.id}
              className="group flex flex-col rounded-xl border border-border/70 bg-card/60 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-card "
            >
              {/* Header */}
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <FiDatabase className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-heading font-semibold leading-tight text-foreground">
                    {row.name}
                  </h3>
                  <p className="truncate text-xs text-muted-foreground">
                    @{row.username}
                  </p>
                </div>
              </div>

              {/* Endpoint */}
              <a
                href={row.endpoint}
                target="_blank"
                rel="noopener noreferrer"
                title={row.endpoint}
                className="mb-3 flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="truncate">{row.endpoint}</span>
              </a>

              {/* Footer */}
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                    row.type === "collection" ? "text-blue-400" : "text-green-400"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {row.type === "collection" ? "Collection" : "Object"}
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