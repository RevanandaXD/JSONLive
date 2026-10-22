"use client";

import { useState } from "react";
import { CopyButton } from "./CopyButton";

export type CodeTab = {
  value: string;
  label: string;
  code: string;
};

export function CodeTabs({
  items,
  language = "code",
}: {
  items: CodeTab[];
  language?: string;
}) {
  const [active, setActive] = useState(items[0]?.value);
  const current = items.find((item) => item.value === active) ?? items[0];

  return (
    <div className="bg-muted/25">
      <div className="flex items-center justify-between gap-3 border-b border-border/40 px-3">
        <div role="tablist" className="flex items-center gap-4">
          {items.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active === item.value}
              onClick={() => setActive(item.value)}
              className={`-mb-px border-b-2 py-2 text-xs font-medium transition-colors ${
                active === item.value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <CopyButton
          value={current?.code ?? ""}
          ariaLabel="Copy code"
          variant="ghost"
          className="h-7 px-1.5 text-[11px]"
        />
      </div>

      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-xs leading-relaxed text-foreground/90 sm:text-[13px]">
        <code data-language={language}>{current?.code}</code>
      </pre>
    </div>
  );
}
