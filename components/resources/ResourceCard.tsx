"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineEllipsisHorizontal,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLink,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlineTrash,
} from "react-icons/hi2";
import { HiEye } from "react-icons/hi";
import type { Resource } from "@/types/resource";
import { CopyButton } from "@/components/ui/CopyButton";
import { timeAgo } from "@/src/lib/format";

type Props = {
  resource: Resource;
  endpoint: string;
  onTogglePublish: (resource: Resource) => void;
  onTogglePrivate: (resource: Resource) => void;
  onDelete: (id: string) => void;
};

const menuBtn =
  "flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground";

const statusStyles = {
  draft: { badge: "bg-muted/60 text-muted-foreground", dot: "bg-muted-foreground", label: "Draft" },
  private: { badge: "bg-amber-500/10 text-amber-400", dot: "bg-amber-400", label: "Private" },
  public: { badge: "bg-primary/10 text-primary", dot: "bg-primary", label: "Published" },
} as const;


export function ResourceCard({
  resource: r,
  endpoint,
  onTogglePublish,
  onTogglePrivate,
  onDelete,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
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
  const status = !r.published ? "draft" : r.private ? "private" : "public";
  const { badge, dot, label } = statusStyles[status];

  return (
    <main className="flex flex-col rounded-md border border-border/70 bg-card/60 p-4 transition-colors hover:border-primary/40 hover:bg-card sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-heading font-semibold leading-tight text-foreground">
            {r.name}
          </h3>
          <p className="mt-0.5 text-xs capitalize text-muted-foreground">
            {type}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold ${badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          {label}
        </span>
      </div>

      {/* Endpoint */}
      <a
        href={endpoint}
        target="_blank"
        rel="noopener noreferrer"
        title={endpoint}
        className="mt-4 flex min-w-0 items-center gap-1.5 rounded border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
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

        <div ref={menuRef} className="relative flex items-center gap-2">
          <Link
            href={`/resources/${r.id}`}
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
          >
            <HiEye className="h-4 w-4" />
            View
          </Link>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="More actions"
            aria-expanded={menuOpen}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
          >
            <HiOutlineEllipsisHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-border bg-background p-1 shadow-xl">
              <a
                href={endpoint}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className={menuBtn}
              >
                <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
                Open
              </a>
              <CopyButton
                value={endpoint}
                label="Copy URL"
                ariaLabel={`Copy endpoint for ${r.name}`}
                className="w-full justify-start border-transparent px-2.5 py-2 text-sm font-medium hover:bg-muted/60"
              />
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
                  onTogglePrivate(r);
                  setMenuOpen(false);
                }}
                className={menuBtn}
              >
                {r.private ? (
                  <>
                    <HiOutlineLockOpen className="h-4 w-4" />
                    Make Public
                  </>
                ) : (
                  <>
                    <HiOutlineLockClosed className="h-4 w-4" />
                    Make Private
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
    </main>
  );
}