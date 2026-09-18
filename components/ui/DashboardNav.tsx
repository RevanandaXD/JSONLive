"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import { UserCard } from "./UserCard";
import { LoginButton } from "./LoginButton";
import { Logo } from "./Logo";
import { UseUIStore } from "@/stores/ui-store";

const navLinks = [
  { name: "Overview", route: "/dashboard" },
  { name: "API Docs", route: "/docs" },
  { name: "Public APIs", route: "/public" },
];

export const DashboardNav = ({
  showUser = true,
  loginOnly = false,
}: {
  showUser?: boolean;
  loginOnly?: boolean;
}) => {
  const pathname = usePathname();

  const { sidebarOpen,toggleSidebar, closeSidebar } = UseUIStore()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

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

          {showUser && <UserCard className="hidden sm:flex" />}
          {loginOnly && <LoginButton className="hidden sm:flex" />}

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
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => closeSidebar()}
          />
          <div className="relative z-40 border-t border-border/60 bg-background md:hidden">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6">
              <nav className="flex flex-col gap-1">
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
              </nav>
              {showUser && <UserCard />}
              {loginOnly && <LoginButton />}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
