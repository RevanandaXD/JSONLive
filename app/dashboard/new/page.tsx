"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HiOutlineArrowLeft, HiOutlineSparkles } from "react-icons/hi2";
import { HiCheck, HiX } from "react-icons/hi";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { Field, TextInput } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/Switch";
import { useCreateResources } from "@/hooks/useCreateResource";
import { api } from "@/src/lib/api";
import { useSession } from "@/src/lib/auth-client";
import { DEFAULT_USERNAME, PUBLIC_BASE_URL } from "@/src/lib/config";
import { formatBytes, slugify } from "@/src/lib/format";
import type { Resource } from "@/types/resource";
import { FormatJSON } from "./format";

type EditorStatus = "valid" | "invalid" | "empty";

const placeholder = `{
  "name": "Revan",
  "role": "Developer",
  "skills": ["React", "Next.js"]
}`;

function parseJson(value: string): { ok: boolean; error?: string } {
  if (!value.trim()) return { ok: true };
  try {
    JSON.parse(value);
    return { ok: true };
  } catch (e: unknown) {
    if (e instanceof Error) return { ok: false, error: e.message };
    return { ok: false, error: "Invalid JSON" };
  }
}

function CreateResourcePage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [name, setName] = useState("");
  const [data, setData] = useState("");
  const [touched, setTouched] = useState(false);
  const [published, setPublished] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(!!editId);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const { data: sessionData, isPending: sessionPending } = useSession();
  const user = sessionData?.user;
  const username = user?.username || DEFAULT_USERNAME;
  const { createResource, isPending, isError } = useCreateResources();

  useEffect(() => {
    if (!editId) return;

    api
      .get<{ status: number; data: Resource }>(`/api/resources/${editId}`)
      .then((res) => {
        const r = res.data;
        setName(r.name);
        setData(JSON.stringify(r.data, null, 2));
        setPublished(r.published);
        setIsPrivate(r.private);
        setLoading(false);
      })
      .catch(() => {
        router.push("/dashboard");
      });
  }, [editId, router]);

  if (!user && !sessionPending) {
    router.push("/login");
    return null;
  }

  const parsed = parseJson(data);
  const valid = parsed.ok && data.trim().length > 0;
  const status: EditorStatus = !data.trim()
    ? "empty"
    : parsed.ok
      ? "valid"
      : "invalid";

  const format = (indent: number) => {
    if (!parsed.ok) {
      setTouched(true);
      return;
    }
    setData(JSON.stringify(JSON.parse(data), null, indent));
    setTouched(false);
  };

  const handleSubmit = async () => {
    if (!valid) return;
    setErrorMessage(null);

    const payload = {
      name: name.trim(),
      data: JSON.parse(data),
      published,
      private: isPrivate,
    };

    try {
      if (editId) {
        await api.put<{ status: number; data: Resource }>(
          `/api/resources/${editId}`,
          payload,
        );
      } else {
        await createResource(payload);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const errStatus = (err as { status?: number })?.status;
      const message =
        (err as { message?: string })?.message || "Failed to save resource";
      if (errStatus === 401 || message?.includes("401")) {
        router.push("/login");
      } else {
        setErrorMessage(message);
      }
    }
  };

  const slug = slugify(name);

  return (
    <div className="min-h-screen">
      <DashboardNav />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Heading */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-0.5 font-heading text-2xl font-bold tracking-tight text-foreground">
              {editId ? "Edit Resource" : "Create Resource"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {editId
                ? "Update your JSON, then the endpoint serves the latest version."
                : "Paste your JSON and get a public API endpoint."}
            </p>
          </div>

          <ButtonLink
            href="/dashboard"
            variant="outline"
            className="hidden text-muted-foreground sm:inline-flex"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </ButtonLink>
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Settings column */}
            <Card className="h-fit">
              <CardHeader title="Settings" />
              <CardBody className="flex flex-col gap-5 p-5">
                <Field label="Resource name" htmlFor="resource-name">
                  <TextInput
                    id="resource-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. users"
                  />
                  {slug && (
                    <p className="mt-2 truncate rounded-md border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs text-muted-foreground">
                      {PUBLIC_BASE_URL}/api/{username}/{slug}
                    </p>
                  )}
                </Field>

                <Switch
                  label="Publish to public API"
                  checked={published}
                  onChange={setPublished}
                  hint={
                    published
                      ? "Anyone can GET this endpoint on /public."
                      : "Kept private until you publish it from the dashboard."
                  }
                />

                <Switch
                  label="Require authentication"
                  tone="amber"
                  checked={isPrivate}
                  onChange={setIsPrivate}
                  hint={
                    isPrivate
                      ? "Only the resource owner can GET this endpoint."
                      : "Anyone can GET this endpoint without login."
                  }
                />

                <div className="flex flex-col gap-2">
                  <Button variant="primary" onClick={() => format(2)}>
                    <HiOutlineSparkles className="h-4 w-4" />
                    Format JSON
                  </Button>
                  <Button variant="outline" onClick={() => format(0)}>
                    Minify
                  </Button>
                  <CopyButton
                    value={data}
                    label="Copy JSON"
                    ariaLabel="Copy JSON to clipboard"
                    className="w-full px-4 py-2.5 text-sm"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Editor column */}
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  JSON Data
                </h2>
                <div className="flex items-center gap-2">
                  {touched && status === "invalid" && (
                    <Badge tone="red" className="gap-1 font-sans">
                      <HiX className="h-3.5 w-3.5" />
                      Invalid JSON
                    </Badge>
                  )}
                  {status === "valid" && (
                    <Badge tone="emerald" className="gap-1 font-sans">
                      Valid JSON
                    </Badge>
                  )}
                </div>
              </div>

              {isError || errorMessage ? (
                <div className="p-4">
                  <Alert tone="danger" icon={HiX} title="Save failed">
                    {errorMessage || "Failed to save resource"}
                  </Alert>
                </div>
              ) : null}

              <FormatJSON
                value={data}
                onChange={(v) => {
                  setData(v);
                  setTouched(true);
                }}
                placeholder={placeholder}
                invalid={status === "invalid"}
              />

              <CardFooter className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatBytes(new Blob([data]).size)}
                </span>
                <Button
                  variant="primary"
                  disabled={!valid || isPending}
                  onClick={handleSubmit}
                >
                  {isPending
                    ? "Saving..."
                    : editId
                      ? "Save Changes"
                      : "Create Resource"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default function NewResourcePage() {
  return (
    <Suspense>
      <CreateResourcePage />
    </Suspense>
  );
}
