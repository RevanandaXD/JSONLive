"use client";

import Link from "next/link";
import { useState } from "react";
import { HiOutlineArrowLeft, HiOutlineClipboard, HiOutlineSparkles } from "react-icons/hi2";
import { HiCheck, HiX } from "react-icons/hi";
import { DashboardNav } from "@/components/ui/DashboardNav";
import { FormatJSON } from "./format";
import { useRouter } from "next/navigation";
import { useCreateResources } from "@/hooks/useCreateResource";
import { DEFAULT_USERNAME } from "@/src/lib/config";

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


export default function CreateResourcePage() {
  const [name, setName] = useState("");
  const [data, setData] = useState("");
  const [touched, setTouched] = useState(false);

  const router = useRouter();
  const { createResource, isPending, isError } = useCreateResources();

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

    try {
      await createResource({
        name: name.trim(),
        data: JSON.parse(data),
      });
      router.push("/dashboard");
    } catch {
      /* create failed */
    }
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  return (
    <div className="min-h-screen">
      <DashboardNav />

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Heading */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight mb-0.5">
                Create Resource
              </h1>
              <p className="text-sm text-muted-foreground">
                Paste your JSON and get a public API endpoint.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground sm:inline-flex"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Settings column */}
          <div className="h-fit overflow-hidden rounded-xl border border-border/70 bg-card/60">
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
                  className="w-full rounded-lg border border-border/70 bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary/50"
                />
                {slug && (
                  <p className="mt-2 truncate rounded-lg border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs text-muted-foreground">
                    /{DEFAULT_USERNAME}/{slug}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleFormat}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-background transition-all duration-200 hover:bg-primary-hover"
                >
                  <HiOutlineSparkles className="h-4 w-4" />
                  Format JSON
                </button>
                <button
                  onClick={handleMinify}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
                >
                  Minify
                </button>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
                >
                  <HiOutlineClipboard className="h-4 w-4" />
                  Copy JSON
                </button>
              </div>
            </div>
          </div>

          {/* Editor column */}
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
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
              {isError && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-red-400">
                  <HiX className="h-4 w-4" />
                  Failed to create
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
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-background transition-all duration-200 enabled:hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending ? "Creating..." : "Create Resource"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
