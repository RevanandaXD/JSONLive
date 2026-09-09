"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { UserCard } from "./UserCard";
import { UseUIStore } from "@/stores/ui-store";

const navLinks = [
  { name: "Overview", route: "/dashboard" },
  { name: "API Docs", route: "/dashboard/docs" },
];

export const DashboardNav = () => {
  const pathname = usePathname();

  const { sidebarOpen,toggleSidebar, closeSidebar } = UseUIStore()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading font-bold tracking-tight text-foreground"
        >
          <span className="inline-flex items-center justify-center rounded-md bg-primary px-1.5 py-0.5 font-mono text-xs font-black text-background">
            {"{ }"}
          </span>
          <span>JSONLive</span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.route;
              return (
                <Link
                  key={link.name}
                  href={link.route}
                  className={`px-3.5 py-2 text-sm font-medium ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <UserCard className="hidden sm:flex" />

          <button
            className="flex cursor-pointer items-center justify-center rounded-lg bg-transparent p-2 text-foreground md:hidden"
            onClick={() => toggleSidebar()}
            aria-label="Toggle menu"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div className="border-t border-border/60 md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.route}
                onClick={() => closeSidebar()}
                className="py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/dashboard/new"
              onClick={() => closeSidebar()}
              className="mt-2 rounded-lg bg-primary px-3.5 py-2.5 text-center text-sm font-bold text-background"
            >
              New Resource
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
