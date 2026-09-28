import type { ReactNode } from "react";

export type BadgeTone =
  | "primary"
  | "muted"
  | "emerald"
  | "sky"
  | "amber"
  | "violet"
  | "red";

const tones: Record<BadgeTone, string> = {
  primary: "bg-primary/15 text-primary",
  muted: "bg-muted text-muted-foreground",
  emerald: "bg-emerald-500/15 text-emerald-400",
  sky: "bg-sky-500/15 text-sky-400",
  amber: "bg-amber-500/15 text-amber-400",
  violet: "bg-violet-500/15 text-violet-400",
  red: "bg-red-500/15 text-red-400",
};

export function Badge({
  tone = "muted",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`shrink-0 rounded-md px-2 py-1 font-mono text-xs font-bold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const methodTones: Record<string, BadgeTone> = {
  GET: "emerald",
  POST: "sky",
  PUT: "amber",
  PATCH: "violet",
  DELETE: "red",
  OPTIONS: "muted",
};

export function MethodBadge({ method }: { method: string }) {
  return <Badge tone={methodTones[method] ?? "muted"}>{method}</Badge>;
}
