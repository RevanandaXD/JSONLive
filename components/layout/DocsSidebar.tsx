"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

export type DocsNavItem = {
  id: string;
  label: string;
};

export type DocsNavGroup = {
  group: string;
  items: DocsNavItem[];
};

type DocsNavProps = {
  groups: DocsNavGroup[];
};

function useActiveSection(groups: DocsNavGroup[]) {
  const ids = useMemo(
    () => groups.flatMap((group) => group.items.map((item) => item.id)),
    [groups],
  );

  const [active, setActive] = useState(ids[0] ?? "");
  const frameRef = useRef(0);

  useEffect(() => {
    const compute = () => {
      frameRef.current = 0;
      const offset = 140;
      let current = ids[0] ?? "";

      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top - offset <= 0) current = id;
      }

      const scrolledToBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;

      if (scrolledToBottom) current = ids[ids.length - 1] ?? current;

      setActive(current);
    };

    const onScroll = () => {
      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return { active, setActive };
}

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  element.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
}

export function DocsSidebar({ groups }: DocsNavProps) {
  const { active, setActive } = useActiveSection(groups);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setActive(id);
    scrollToSection(id);
  };

  return (
    <nav className="text-[13px]">
      {groups.map((group) => (
        <div key={group.group} className="mb-7 last:mb-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
            {group.group}
          </p>

          <ul className="mt-3 space-y-0.5 border-l border-border/50">
            {group.items.map((item) => {
              const isActive = active === item.id;

              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(event) => handleClick(event, item.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`-ml-px block border-l-2 py-1.5 pl-3 transition-colors ${
                      isActive
                        ? "border-primary font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocsSectionNav({ groups }: DocsNavProps) {
  const { active, setActive } = useActiveSection(groups);
  const items = useMemo(
    () => groups.flatMap((group) => group.items),
    [groups],
  );

  const handleClick = (event: MouseEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault();
    setActive(id);
    scrollToSection(id);
  };

  return (
    <nav
      aria-label="Documentation sections"
      className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => {
        const isActive = active === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={(event) => handleClick(event, item.id)}
            aria-current={isActive ? "true" : undefined}
            className={`shrink-0 border-b-2 px-3 py-2 text-[13px] transition-colors ${
              isActive
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
