"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HiOutlineArrowLeft, HiOutlineClipboard, HiOutlineSparkles } from "react-icons/hi2";
import { HiCheck, HiX } from "react-icons/hi";
import { DashboardNav } from "@/components/ui/DashboardNav";
import { FormatJSON } from "./format";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateResources } from "@/hooks/useCreateResource";
import { api } from "@/src/lib/api";
import { useSession } from "@/src/lib/auth-client";
import { DEFAULT_USERNAME, PUBLIC_BASE_URL } from "@/src/lib/config";
import type { Resource } from "@/types/resource";

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

const fieldClass =
  "w-full rounded-none border border-border/70 bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary/50";

export default function CreateResourcePage() {
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

  const handleFormat = () => {
    if (!parsed.ok) {
      setTouched(true);
      return;
    }
    setData(JSON.stringify(JSON.parse(data), null, 2));
    setTouched(false);
  };

  const handleMinify = () => {
    if (!parsed.ok) {
      setTouched(true);
      return;
    }
    setData(JSON.stringify(JSON.parse(data)));
    setTouched(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data);
    } catch {
      /* clipboard unavailable */
    }
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
      const status = (err as { status?: number })?.status;
      const message = (err as { message?: string })?.message || "Failed to save resource";
      if (status === 401 || message?.includes("401")) {
        router.push("/login");
      } else {
        setErrorMessage(message);
      }
    }
  };

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  return (
    <div className="min-h-screen">
      <DashboardNav />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Heading */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="mb-0.5 font-heading text-2xl font-bold tracking-tight">
                {editId ? "Edit Resource" : "Create Resource"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {editId
                  ? "Update your JSON, then the endpoint serves the latest version."
                  : "Paste your JSON and get a public API endpoint."}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="hidden items-center gap-1.5 border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground sm:inline-flex"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="h-64 animate-pulse border border-border/70 bg-card/60" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Settings column */}
            <div className="h-fit overflow-hidden border border-border/70 bg-card/60">
              <div className="border-b border-border/60 px-5 py-3">
                <h2 className="text-sm font-semibold">Settings</h2>
              </div>
              <div className="flex flex-col gap-5 p-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Resource name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. users"
                    className={fieldClass}
                  />
                  {slug && (
                    <p className="mt-2 truncate border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs text-muted-foreground">
                      {PUBLIC_BASE_URL}/api/{username}/{slug}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">
                      Publish to public API
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={published}
                      onClick={() => setPublished((p) => !p)}
                      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                        published ? "bg-primary" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                          published ? "left-4.5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {published
                      ? "Anyone can GET this endpoint on /public."
                      : "Kept private until you publish it from the dashboard."}
                  </p>
                </div>

                <div>
                  <label className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">
                      Require authentication
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isPrivate}
                      onClick={() => setIsPrivate((p) => !p)}
                      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                        isPrivate ? "bg-amber-500" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                          isPrivate ? "left-[18px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {isPrivate
                      ? "GET hanya bisa diakses oleh pemilik resource."
                      : "Anyone can GET this endpoint without login."}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleFormat}
                    className="inline-flex items-center justify-center gap-2 border border-primary bg-primary px-4 py-2.5 text-sm font-bold text-background transition-colors hover:bg-primary-hover"
                  >
                    <HiOutlineSparkles className="h-4 w-4" />
                    Format JSON
                  </button>
                  <button
                    onClick={handleMinify}
                    className="inline-flex items-center justify-center gap-2 border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
                  >
                    Minify
                  </button>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-2 border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
                  >
                    <HiOutlineClipboard className="h-4 w-4" />
                    Copy JSON
                  </button>
                </div>
              </div>
            </div>

            {/* Editor column */}
            <div className="overflow-hidden border border-border/70 bg-card">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <span className="text-sm font-semibold">JSON Data</span>
                {touched && status === "invalid" && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-red-400">
                    <HiX className="h-4 w-4" />
                    Invalid JSON
                  </span>
                )}
                {status === "valid" && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-green-400">
                    <HiCheck className="h-4 w-4" />
                    Valid JSON
                  </span>
                )}
                {(isError || errorMessage) && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-red-400">
                    <HiX className="h-4 w-4" />
                    {errorMessage || "Failed to save"}
                  </span>
                )}
              </div>

              <FormatJSON
                value={data}
                onChange={(v) => {
                  setData(v);
                  setTouched(true);
                }}
                placeholder={placeholder}
                invalid={status === "invalid"}
              />

              <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
                <span className="text-xs text-muted-foreground">
                  {data ? new Blob([data]).size.toLocaleString() : 0} bytes
                </span>
                <button
                  disabled={!valid || isPending}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 border border-primary bg-primary px-5 py-2 text-sm font-bold text-background transition-colors enabled:hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isPending
                    ? "Saving..."
                    : editId
                      ? "Save Changes"
                      : "Create Resource"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}