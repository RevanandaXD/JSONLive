"use client";

import { useState, type ReactNode } from "react";

export type TabItem = {
  value: string;
  label: string;
  content: ReactNode;
};

export function Tabs({
  items,
  defaultValue,
  className = "",
}: {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
}) {
  const [active, setActive] = useState(defaultValue ?? items[0]?.value);

  return (
    <div className={className}>
      <div
        role="tablist"
        className="flex items-center gap-1 border-b border-border/60 px-3 py-2"
      >
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active === item.value}
            onClick={() => setActive(item.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              active === item.value
                ? "bg-muted/70 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {items.find((item) => item.value === active)?.content}
    </div>
  );
}
