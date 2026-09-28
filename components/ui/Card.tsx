import type { IconType } from "react-icons";
import type { ReactNode } from "react";

export type CardTone = "default" | "danger";

type CardProps = {
  tone?: CardTone;
  className?: string;
  children?: ReactNode;
};

export function Card({ tone = "default", className = "", children }: CardProps) {
  const danger = tone === "danger";

  return (
    <section
      className={`flex flex-col overflow-hidden rounded-md border bg-card/60 ${
        danger ? "border-red-500/30" : "border-border/70"
      } ${className}`}
    >
      {children}
    </section>
  );
}

type CardHeaderProps = {
  icon?: IconType;
  title: string;
  description?: ReactNode;
  tone?: CardTone;
  className?: string;
};

export function CardHeader({
  icon: Icon,
  title,
  description,
  tone = "default",
  className = "",
}: CardHeaderProps) {
  const danger = tone === "danger";

  return (
    <div
      className={`flex items-start gap-3 border-b px-5 py-4 ${
        danger ? "border-red-500/20" : "border-border/60"
      } ${className}`}
    >
      {Icon && (
        <Icon
          aria-hidden
          className={`mt-0.5 h-5 w-5 shrink-0 ${
            danger ? "text-red-500" : "text-primary"
          }`}
        />
      )}
      <div className="min-w-0">
        <h2
          className={`text-sm font-semibold ${
            danger ? "text-red-500" : "text-foreground"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export function CardBody({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`mt-auto border-t border-border/60 px-5 py-3.5 ${className}`}
    >
      {children}
    </div>
  );
}
