"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

const navLinks = [
  { name: "Features", route: "#features" },
  { name: "How It Works", route: "#how-it-works" },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const sections = navLinks
        .map((l) => document.querySelector(l.route))
        .filter(Boolean) as Element[];
      let current = "";
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4) {
          current = `#${section.id}`;
        }
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const linkClass = (route: string) =>
    `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 hover:text-foreground ${
      active === route
        ? "text-foreground bg-foreground/5"
        : "text-muted-foreground hover:bg-foreground/5"
    }`;

  return (
    <>
      <nav
        className={`fixed left-1/2 -translate-x-1/2 z-50 top-3 rounded-full border backdrop-blur-xl transition-all duration-400 ease-out w-[min(825px,calc(100vw-24px))] bg-background/85 ${
          scrolled ? "border-primary/15 shadow-[0_8px_32px_rgba(0,0,0,0.45)]" : "border-border/60"
        }`}
      >
        <div className="mx-auto flex items-center justify-between px-5 h-15">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 font-heading font-bold tracking-tight text-foreground"
          >
            <span className="inline-flex items-center justify-center rounded-md bg-primary px-1.5 py-0.5 font-mono text-[10px] font-black text-background transition-all duration-300 group-hover:-rotate-">
              {"{ }"}
            </span>
            <span className="text-lg">JSONLive</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a key={link.name} href={link.route} className={linkClass(link.route)}>
                {link.name}
              </a>
            ))}
            <Link
              href="/dashboard"
              className="ml-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-background shadow-[0_2px_12px_rgba(34,197,94,0.25)] transition-all duration-200 hover:bg-primary-hover active:translate-y-0"
            >
              Open Dashboard
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="flex cursor-pointer items-center justify-center rounded-lg border-none bg-transparent p-2 text-foreground md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <HiX className="h-5 w-5" />
            ) : (
              <HiMenu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
            mobileOpen ? "max-h-56 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-1 border-t border-border/60 px-4 pb-4 pt-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.route}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-foreground/5 hover:text-foreground"
              >
                {link.name}
              </a>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-xl bg-primary px-3.5 py-2.5 text-center text-sm font-bold text-background"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-20" />
    </>
  );
};
