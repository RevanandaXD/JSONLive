"use client";

import Link from "next/link";
import { useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineLink,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineMagnifyingGlass,
  HiOutlineServerStack,
  HiOutlineCube,
  HiOutlineClock,
} from "react-icons/hi2";
import { HiCheck } from "react-icons/hi";
import { DashboardHeader } from "@/components/ui/dashboard-header";

type Resource = {
  id: string;
  name: string;
  slug: string;
  username: string;
  size: string;
  updatedAt: string;
  type: "object" | "collection";
};

const initialResources: Resource[] = [
  {
    id: "1",
    name: "Users",
    slug: "users",
    username: "revan",
    size: "2.1 KB",
    updatedAt: "2 hours ago",
    type: "collection",
  },
  {
    id: "2",
    name: "Profile",
    slug: "profile",
    username: "revan",
    size: "480 B",
    updatedAt: "1 day ago",
    type: "object",
  },
  {
    id: "3",
    name: "Products",
    slug: "products",
    username: "revan",
    size: "5.8 KB",
    updatedAt: "3 days ago",
    type: "collection",
  },
];

const endpoint = (r: Resource) =>
  `https://jsonlive.example/${r.username}/${r.slug}`;

const stats = [
  { label: "Total Resources", value: "6", icon: HiOutlineCube },
  { label: "Endpoints Live", value: "6", icon: HiOutlineServerStack },
  { label: "Total Requests", value: "1.2k", icon: HiOutlineClock },
];

export default function DashboardPage() {
  const [resources, setResources] = useState(initialResources);
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = resources.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.slug.toLowerCase().includes(query.toLowerCase()),
  );

  const handleCopy = async (r: Resource) => {
    try {
      await navigator.clipboard.writeText(endpoint(r));
      setCopiedId(r.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleDelete = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-6 py-10">
        
        <div className="mb-7.5 flex justify-start gap-2">
            <h1 className="text-3xl font-medium">Welcome Home</h1>
            <span className="inline-block text-3xl font-bold">User...</span>
        </div>

        {/* Heading */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              My Resources
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your JSON endpoints
            </p>
          </div>

          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-background transition-all duration-200 hover:bg-primary-hover hover:shadow-[0_4px_24px_rgba(34,197,94,0.3)]"
          >
            <HiOutlinePlus className="h-5 w-5" />
            Create Resource
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex items-center gap-4 rounded-xl border border-border/70 bg-card/60 p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-heading text-xl font-bold leading-none">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search + filter row */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 transition-colors focus-within:border-primary/50">
            <HiOutlineMagnifyingGlass className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <span className="rounded-full bg-card/60 px-3 py-1.5 border border-border/60">
              {filtered.length} shown
            </span>
          </div>
        </div>

        {/* Resource list */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-16 text-center">
            <HiOutlineDocumentText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="mb-1 font-heading text-lg font-semibold">
              No resources found
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              {query
                ? "Try a different search term."
                : "Create your first JSON endpoint to get started."}
            </p>
            {!query && (
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:bg-primary-hover"
              >
                <HiOutlinePlus className="h-4 w-4" />
                Create Resource
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="group relative flex flex-col rounded-xl border border-border/70 bg-card/60 p-5 transition-all duration-300 hover:border-primary/25 hover:bg-card"
              >
                {/* Resource header */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HiOutlineDocumentText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-heading font-semibold leading-tight">
                      {r.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs ${
                        r.type === "collection"
                          ? "text-blue-400"
                          : "text-green-400"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {r.type === "collection" ? "Collection" : "Object"}
                    </span>
                  </div>
                  <span className="ml-auto shrink-0 rounded-md border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                    {r.size}
                  </span>
                </div>

                {/* Endpoint */}
                <a
                  href={endpoint(r)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 truncate rounded-lg border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  /{r.username}/{r.slug}
                </a>

                {/* Meta */}
                <p className="mb-5 text-xs text-muted-foreground/70">
                  Updated {r.updatedAt}
                </p>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(r)}
                    className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      copiedId === r.id
                        ? "border-primary/40 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {copiedId === r.id ? (
                      <>
                        <HiCheck className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <HiOutlineLink className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                  <Link
                    href={endpoint(r)}
                    target="_blank"
                    aria-label={`Open ${r.name}`}
                    className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
                  >
                    <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/resources/${r.id}`}
                    aria-label={`Edit ${r.name}`}
                    className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <HiOutlinePencil className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(r.id)}
                    aria-label={`Delete ${r.name}`}
                    className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-400"
                  >
                    <HiOutlineTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
