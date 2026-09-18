"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineLink,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineChevronRight,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import { HiCheck } from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";
import { DashboardNav } from "@/components/ui/DashboardNav";
import { api } from "@/src/lib/api";
import { useSession } from "@/src/lib/auth-client";
import { PUBLIC_BASE_URL } from "@/src/lib/config";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Resource } from "@/types/resource";

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();

  const { data: sessionData } = useSession();
  const user = sessionData?.user;
  const username = user?.username ?? "";
  const [copied, setCopied] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["resource", id],
    queryFn: async () => {
      const res = await api.get<{ status: number; data: Resource }>(
        `/api/resources/${id}`,
      );
      return res.data;
    },
    enabled: !!id,
  });

  if (isPending) {
    return (
      <div className="min-h-screen">
        <DashboardNav />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
          <Skeleton />
        </main>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen">
        <DashboardNav />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <p className="text-sm text-red-500">
            Resource tidak ditemukan atau kamu tidak memiliki akses ke resource ini.
          </p>
        </main>
      </div>
    );
  }

  const type = Array.isArray(data.data) ? "collection" : "object";
  const bytes = new TextEncoder().encode(JSON.stringify(data.data)).length;
  const size =
    bytes >= 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : bytes >= 1024
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${bytes} B`;
  const endpoint = `${PUBLIC_BASE_URL}/api/${username}/${data.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(endpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleTogglePublish = async () => {
    try {
      await api.patch(`/api/resources/${data.id}`, {
        published: !data.published,
      });
      refetch();
    } catch {
      /* fallthrough */
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${data.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/resources/${data.id}`);
      router.push("/dashboard");
    } catch {
      /* fallthrough */
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardNav />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Breadcrumb / back */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <HiOutlineDocumentText className="h-4 w-4" />
              <HiOutlineChevronRight className="h-3 w-3" />
              <span>/resources/{data.id}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-3xl font-medium tracking-tight">
                {data.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  type === "collection"
                    ? "border-blue-400/30 text-blue-400"
                    : "border-green-400/30 text-green-400"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {type === "collection" ? "Collection" : "Object"}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  data.published
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {data.published ? "Published" : "Draft"}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {size} · Updated {new Date(data.updatedAt).toLocaleString()}
            </p>
          </div>

          <button
            onClick={handleCopy}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors ${
              copied
                ? "border border-primary/40 text-primary"
                : "bg-primary text-background hover:bg-primary-hover"
            }`}
          >
            {copied ? (
              <>
                <HiCheck className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <HiOutlineLink className="h-4 w-4" />
                Copy URL
              </>
            )}
          </button>
        </div>

        {/* Endpoint */}
        <div className="mb-8 rounded-xl border border-border/70 bg-card/60">
          <div className="border-b border-border/60 px-5 py-3">
            <span className="text-xs font-semibold text-muted-foreground">
              Public Endpoint
            </span>
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex flex-1 items-center gap-2 overflow-hidden">
              <span className="rounded-md bg-primary/15 px-2 py-1 font-mono text-xs font-bold text-primary">
                GET
              </span>
              <code className="truncate font-mono text-sm text-muted-foreground">
                {endpoint}
              </code>
            </div>
          </div>
        </div>

        {/* JSON */}
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card/60">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
            <span className="text-xs font-semibold text-muted-foreground">
              JSON Data
            </span>
            <span className="font-mono text-xs text-muted-foreground/60">
              json
            </span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed sm:text-sm">
            <code>{JSON.stringify(data.data, null, 2)}</code>
          </pre>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={`/dashboard/new?edit=${data.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-background hover:bg-primary-hover"
          >
            <HiOutlinePencil className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={handleTogglePublish}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:border-amber-500/40 hover:text-amber-400"
          >
            {data.published ? (
              <HiOutlineEyeSlash className="h-4 w-4" />
            ) : (
              <HiOutlineEye className="h-4 w-4" />
            )}
            {data.published ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:border-red-500/40 hover:text-red-400"
          >
            <HiOutlineTrash className="h-4 w-4" />
            Delete
          </button>
        </div>
      </main>
    </div>
  );
}