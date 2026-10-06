"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlinePlus, HiOutlineDocumentText } from "react-icons/hi2";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { DashboardSkeleton } from "@/components/layout/DashboardSkeleton";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { api } from "@/src/lib/api";
import useResource from "@/hooks/useResource";
import { useSession } from "@/src/lib/auth-client";
import { formatBytes } from "@/src/lib/format";
import type { Resource } from "@/types/resource";
import {
  DEFAULT_USERNAME,
  LIMITS,
  PUBLIC_BASE_URL,
  STORAGE_LIMIT,
} from "@/src/lib/config";

function UsageBlock({
  label,
  hint,
  used,
  max,
  usedText,
  maxText,
}: {
  label: string;
  hint?: string;
  used: number;
  max: number;
  usedText: string;
  maxText: string;
}) {
  const ratio = Math.min(1, used / max);
  const pct = Math.round(ratio * 100);
  const tone =
    ratio >= 1 ? "bg-red-500" : ratio >= 0.8 ? "bg-amber-500" : "bg-primary";

  return (
    <div className="rounded-md border border-border/70 bg-card/60 p-4">
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {hint && (
            <p className="truncate text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <p className="shrink-0 font-mono text-sm font-medium text-foreground">
          <span className={ratio >= 1 ? "text-red-500" : ""}>{usedText}</span>
          <span className="text-muted-foreground"> / {maxText}</span>
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded bg-muted/60">
        <div
          className={`h-full rounded transition-all ${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: sessionData, isPending: sessionPending } = useSession();
  const user = sessionData?.user;
  const username = user?.username || DEFAULT_USERNAME;

  const { data: resources = [], isPending, isError, refetch } = useResource();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user && !sessionPending) {
      router.push("/login");
    }
  }, [user, sessionPending, router]);

  if (sessionPending) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const getEndpoint = (r: Resource) =>
    `${PUBLIC_BASE_URL}/api/${username}/${r.slug}`;

  if (isPending) {
    return (
      <div className="min-h-screen">
        <DashboardNav />
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen">
        <DashboardNav />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p className="text-sm text-red-500">
            Failed to load resources. Please try again.
          </p>
        </main>
      </div>
    );
  }

  const usedBytes = resources.reduce((acc, r) => {
    try {
      return acc + new TextEncoder().encode(JSON.stringify(r.data)).length;
    } catch {
      return acc;
    }
  }, 0);

  const atLimit = resources.length >= LIMITS.MAX_RESOURCES;

  const filtered = resources.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.slug.toLowerCase().includes(query.toLowerCase()),
  );

  const handlePatch = async (r: Resource, patch: Partial<Resource>) => {
    try {
      await api.patch(`/api/resources/${r.id}`, patch);
      refetch();
    } catch {
      console.error("failed to patch resource");
    }
  };

  const handleTogglePublish = (r: Resource) =>
    handlePatch(r, { published: !r.published });

  const handleTogglePrivate = (r: Resource) =>
    handlePatch(r, { private: !r.private });

  const handleDelete = async (id: string) => {
    const resource = resources.find((r) => r.id === id);
    if (!resource) return;
    if (!confirm(`Delete "${resource.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/resources/${id}`);
      refetch();
    } catch {
      console.error("failed to delete");
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardNav />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end sm:gap-4">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              @{username} · {resources.length}{" "}
              {resources.length === 1 ? "resource" : "resources"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {atLimit && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Limit reached
              </span>
            )}
            <ButtonLink
              href={atLimit ? "/dashboard" : "/dashboard/new"}
              variant="primary"
              aria-disabled={atLimit}
              className="gap-2 enabled:hover:bg-primary-hover"
            >
              <HiOutlinePlus className="h-4 w-4" />
              <span className="hidden sm:inline">New Resource</span>
              <span className="sm:hidden">New</span>
            </ButtonLink>
          </div>
        </div>

        {/* Usage */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <UsageBlock
            label="Resources"
            hint={`Up to ${LIMITS.MAX_RESOURCES} resources per user`}
            used={resources.length}
            max={LIMITS.MAX_RESOURCES}
            usedText={`${resources.length}`}
            maxText={`${LIMITS.MAX_RESOURCES}`}
          />
          <UsageBlock
            label="Storage"
            hint={`Up to ${formatBytes(LIMITS.MAX_JSON_SIZE)} per resource`}
            used={usedBytes}
            max={STORAGE_LIMIT}
            usedText={formatBytes(usedBytes)}
            maxText={formatBytes(STORAGE_LIMIT)}
          />
        </div>

        {/* Search */}
        <div className="mb-6 max-w-md">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search resources..."
            ariaLabel="Search resources"
          />
        </div>

        {/* Resource grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={HiOutlineDocumentText}
            title={query ? "No results" : "No resources yet"}
            description={
              query
                ? "Try a different keyword."
                : "Create your first resource to get a public API endpoint."
            }
            action={
              !query ? (
                <ButtonLink href="/dashboard/new" variant="primary" size="sm">
                  <HiOutlinePlus className="h-4 w-4" />
                  Create Resource
                </ButtonLink>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                endpoint={getEndpoint(r)}
                onTogglePublish={handleTogglePublish}
                onTogglePrivate={handleTogglePrivate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
