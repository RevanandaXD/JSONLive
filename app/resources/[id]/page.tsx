"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlineChevronRight,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi2";
import { useQuery } from "@tanstack/react-query";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/src/lib/api";
import { useSession } from "@/src/lib/auth-client";
import { PUBLIC_BASE_URL } from "@/src/lib/config";
import { formatBytes } from "@/src/lib/format";
import type { Resource } from "@/types/resource";

const STATUS = {
  draft: { tone: "muted", label: "Draft" },
  private: { tone: "amber", label: "Private" },
  public: { tone: "primary", label: "Published" },
} as const;

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();

  const { data: sessionData } = useSession();
  const username = sessionData?.user?.username ?? "";

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
            Resource not found, or you do not have access to this resource.
          </p>
        </main>
      </div>
    );
  }

  const type = Array.isArray(data.data) ? "collection" : "object";
  const size = formatBytes(
    new TextEncoder().encode(JSON.stringify(data.data)).length,
  );
  const endpoint = `${PUBLIC_BASE_URL}/api/${username}/${data.slug}`;
  const status = !data.published
    ? "draft"
    : data.private
      ? "private"
      : "public";

  const toggle = async (patch: Partial<Resource>) => {
    try {
      await api.patch(`/api/resources/${data.id}`, patch);
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
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <HiOutlineDocumentText className="h-4 w-4" />
              <HiOutlineChevronRight className="h-3 w-3" />
              <span>/resources/{data.id}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-3xl font-medium tracking-tight text-foreground">
                {data.name}
              </h1>
              <Badge tone={type === "collection" ? "sky" : "primary"}>
                {type === "collection" ? "Collection" : "Object"}
              </Badge>
              <Badge tone={STATUS[status].tone}>{STATUS[status].label}</Badge>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {size} · Updated {new Date(data.updatedAt).toLocaleString()}
            </p>
          </div>

          <CopyButton
            value={endpoint}
            label="Copy URL"
            copiedLabel="Copied"
            ariaLabel="Copy endpoint"
            className="border-primary px-4 py-2.5 text-sm text-background hover:bg-primary-hover hover:text-background"
          />
        </div>

        {/* Endpoint */}
        <Card className="mb-8">
          <CardHeader title="Public Endpoint" />
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Badge tone="emerald">GET</Badge>
              <code className="truncate font-mono text-sm text-muted-foreground">
                {endpoint}
              </code>
            </div>
          </div>
        </Card>

        {/* JSON */}
        <Card>
          <CardHeader title="JSON Data" />
          <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed sm:text-sm">
            <code>{JSON.stringify(data.data, null, 2)}</code>
          </pre>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-end gap-2">
          <ButtonLink
            href={`/dashboard/new?edit=${data.id}`}
            variant="outline"
            className="text-muted-foreground"
          >
            <HiOutlinePencil className="h-4 w-4" />
            Edit
          </ButtonLink>
          <Button
            variant="outline"
            className="text-muted-foreground"
            onClick={() => toggle({ published: !data.published })}
          >
            {data.published ? (
              <HiOutlineEyeSlash className="h-4 w-4" />
            ) : (
              <HiOutlineEye className="h-4 w-4" />
            )}
            {data.published ? "Unpublish" : "Publish"}
          </Button>
          <Button
            variant="outline"
            className="text-muted-foreground hover:border-amber-500/40 hover:text-amber-400"
            onClick={() => toggle({ private: !data.private })}
          >
            {data.private ? (
              <HiOutlineLockOpen className="h-4 w-4" />
            ) : (
              <HiOutlineLockClosed className="h-4 w-4" />
            )}
            {data.private ? "Make Public" : "Make Private"}
          </Button>
          <Button
            variant="outline"
            className="text-red-500 hover:border-red-500/40 hover:text-red-400"
            onClick={handleDelete}
          >
            <HiOutlineTrash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </main>
    </div>
  );
}
