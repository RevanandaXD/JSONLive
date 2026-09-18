"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCube,
  HiOutlineDocumentText,
  HiOutlineEllipsisHorizontal,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLink,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi2";
import { HiCheck } from "react-icons/hi";
import type { Resource } from "@/types/resource";

type Props = {
  resource: Resource;
  endpoint: string;
  onTogglePublish: (resource: Resource) => void;
  onDelete: (id: string) => void;
};

const iconBtn =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground";

const menuBtn =
  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground";

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "baru saja";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} hari lalu`;
  return date.toLocaleDateString();
}

export function ResourceCard({
  resource: r,
  endpoint,
  onTogglePublish,
  onDelete,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const type = Array.isArray(r.data) ? "collection" : "object";

  const copyEndpoint = async () => {
    try {
      await navigator.clipboard.writeText(endpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-border/70 bg-card/60 p-4 transition-colors hover:border-primary/30 hover:bg-card sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {type === "collection" ? (
            <HiOutlineCube className="h-5 w-5" />
          ) : (
            <HiOutlineDocumentText className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading font-semibold leading-tight text-foreground">
            {r.name}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {type === "collection" ? "Collection" : "Object"}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            r.published
              ? "bg-primary/10 text-primary"
              : "bg-muted/60 text-muted-foreground"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              r.published ? "bg-primary" : "bg-muted-foreground"
            }`}
          />
          {r.published ? "Published" : "Draft"}
        </span>
      </div>

      {/* Endpoint */}
      <a
        href={endpoint}
        target="_blank"
        rel="noopener noreferrer"
        title={endpoint}
        className="mt-4 flex min-w-0 items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <HiOutlineLink className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="truncate">
          {endpoint.replace(/^https?:\/\/[^/]+/, "")}
        </span>
      </a>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground/70">
          Updated {timeAgo(new Date(r.updatedAt))}
        </span>

        <div className="flex items-center gap-1.5">
          <a
            href={endpoint}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${r.name}`}
            title="Open"
            className={iconBtn}
          >
            <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
          </a>
          <Link
            href={`/resources/${r.id}`}
            aria-label={`Edit ${r.name}`}
            title="Edit"
            className={iconBtn}
          >
            <HiOutlinePencil className="h-4 w-4" />
          </Link>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="More actions"
              aria-expanded={menuOpen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
            >
              <HiOutlineEllipsisHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-border bg-background p-1 shadow-xl">
                <button
                  onClick={copyEndpoint}
                  className={menuBtn}
                >
                  {copied ? (
                    <>
                      <HiCheck className="h-4 w-4 text-primary" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <HiOutlineLink className="h-4 w-4" />
                      Copy URL
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    onTogglePublish(r);
                    setMenuOpen(false);
                  }}
                  className={menuBtn}
                >
                  {r.published ? (
                    <>
                      <HiOutlineEyeSlash className="h-4 w-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <HiOutlineEye className="h-4 w-4" />
                      Publish
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    onDelete(r.id);
                    setMenuOpen(false);
                  }}
                  className={`${menuBtn} text-red-500 hover:bg-red-500/10 hover:text-red-400`}
                >
                  <HiOutlineTrash className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}