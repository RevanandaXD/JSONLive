import type { IconType } from "react-icons";
import type { ReactNode } from "react";

export type AlertTone = "info" | "success" | "warning" | "danger";

const tones: Record<AlertTone, string> = {
  info: "border-border bg-card/60 text-foreground",
  success: "border-primary/40 bg-primary/10 text-primary",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-500",
  danger: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
};

export function Alert({
  tone = "info",
  icon: Icon,
  title,
  children,
  className = "",
}: {
  tone?: AlertTone;
  icon?: IconType;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className={`rounded-md border px-4 py-3 text-sm ${tones[tone]} ${className}`}
    >
      {Icon && <Icon aria-hidden className="mb-1.5 h-4 w-4" />}
      {title && <p className="font-semibold">{title}</p>}
      {children && (
        <div className={title ? "mt-1 text-xs text-muted-foreground" : ""}>
          {children}
        </div>
      )}
    </div>
  );
}
