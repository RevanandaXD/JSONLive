"use client";

import { useEffect, useState } from "react";

type SidebarItem = {
  id: string;
  label: string;
};

type SidebarGroup = {
  group: string;
  items: SidebarItem[];
};

type SidebarProps = {
  props: SidebarGroup[];
};

export default function DocsSidebar({ props }: SidebarProps) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const updateHash = () => setActive(window.location.hash);

    updateHash();
    window.addEventListener("hashchange", updateHash);

    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, []);

  return (
    <nav className="space-y-6 text-xs">
      {props.map((group) => (
        <div key={group.group}>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {group.group}
          </p>

          <ul className="mt-2 space-y-1 border-l border-border/60 pl-3">
            {group.items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`block py-1 transition-colors ${
                    active === `#${item.id}`
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}