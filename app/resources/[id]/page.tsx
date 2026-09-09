"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineLink,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { HiCheck } from "react-icons/hi";
import { DashboardNav } from "@/components/ui/DashboardNav";

const mock = {
  name: "Users",
  username: "revan",
  slug: "users",
  type: "collection",
  size: "2.1 KB",
  updatedAt: "2 hours ago",
  data: [
    { id: 1, name: "Revan" },
    { id: 2, name: "Budi" },
  ],
};

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "1";
  const resource = { ...mock, id };

  const [copied, setCopied] = useState(false);

  const endpoint = `https://jsonlive.example/${resource.username}/${resource.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(endpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardNav />

      <main className="mx-auto max-w-4xl px-6 py-10">
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
              <span>/resources/{resource.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-medium tracking-tight">
                {resource.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  resource.type === "collection"
                    ? "border-blue-400/30 text-blue-400"
                    : "border-green-400/30 text-green-400"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {resource.type === "collection" ? "Collection" : "Object"}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {resource.size} · Updated {resource.updatedAt}
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
            <code>{JSON.stringify(resource.data, null, 2)}</code>
          </pre>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={`/dashboard/new?edit=${resource.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-background hover:bg-primary-hover"
          >
            <HiOutlinePencil className="h-4 w-4" />
            Edit
          </Link>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:border-red-500/40 hover:text-red-400">
            <HiOutlineTrash className="h-4 w-4" />
            Delete
          </button>
        </div>
      </main>
    </div>
  );
}
