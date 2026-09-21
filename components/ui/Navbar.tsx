"use client";

import Link from "next/link";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { Logo } from "./Logo";

const navLinks = [
  { name: "Features", route: "#features" },
  { name: "How It Works", route: "#how-it-works" },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Logo className="text-lg" />

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
            <Link
              href="/login"
              className="ml-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:bg-primary-hover"
            >
              Login
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="flex cursor-pointer items-center justify-center rounded-lg bg-transparent p-2 text-foreground md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-border md:hidden">
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
