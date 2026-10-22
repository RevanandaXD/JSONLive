"use client";

import Link from "next/link";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { Logo } from "./Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSession } from "@/src/lib/auth-client";

const navLinks = [
  { name: "Features", route: "/#features" },
  { name: "How It Works", route: "/#how-it-works" },
  { name: "Docs API", route: "/docs" }
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data } = useSession();
  const isLoggedIn = !!data?.user;

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Logo href={isLoggedIn ? "/dashboard" : "/"} className="text-lg" />

          {/* Desktop Links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.route}
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {link.name}
              </a>
            ))}
            <ThemeToggle className="ml-1" />
            <Link
              href="/login"
              className="ml-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:bg-primary-hover"
            >
              Login
            </Link>
          </div>

          {/* Mobile right actions */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            {/* Mobile Toggle */}
            <button
              className={`flex cursor-pointer items-center justify-center transition-colors ${
                mobileOpen
                  ? "h-9 w-9 bg-foreground text-background"
                  : "h-9 w-9 text-foreground hover:bg-muted"
              }`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="absolute inset-x-0 top-full z-40 border-b border-border bg-background shadow-xl md:hidden">
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.route}
                  onClick={closeMenu}
                  className="py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {link.name}
                </a>
              ))}
              <Link
                href="/login"
                onClick={closeMenu}
                className="mt-2 rounded-lg bg-primary px-3.5 py-2.5 text-center text-sm font-bold text-background"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
