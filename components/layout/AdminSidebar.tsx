"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  HiOutlineChartBarSquare,
  HiUsers,
  HiChartBarSquare,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { HiMenu, HiX } from "react-icons/hi";
import { Logo } from "./Logo";
import { Skeleton } from "@/components/ui/Skeleton";
import { UseUIStore } from "@/stores/ui-store";
import { useSession, signOut } from "@/src/lib/auth-client";

const navLinks = [
  { name: "Dashboard", route: "/admin", icon: HiOutlineChartBarSquare },
  { name: "User", route: "/admin/users", icon: HiUsers },
  { name: "Resource", route: "/admin/resource", icon: HiChartBarSquare },
];

function isActiveLink(pathname: string, route: string) {
  if (route === "/admin") return pathname === "/admin";
  return pathname === route || pathname.startsWith(`${route}/`);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isPending } = useSession();
  const user = data?.user;

  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    onNavigate?.();
    await signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login"),
      },
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border/60 px-4">
        <Logo href="/admin" />
        <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          Admin
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        <div className="space-y-0.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActiveLink(pathname, link.route);

            return (
              <Link
                key={link.name}
                href={link.route}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.name}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 space-y-1 border-t border-border/60 p-3">
        {isPending ? (
          <Skeleton className="mb-2 h-9 w-full" />
        ) : user ? (
          <div className="flex items-center gap-2.5 px-2 pb-2 pt-1">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-sm font-bold text-primary">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="items-center gap-2.5 rounded px-1.5 py-1.5 text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, closeSidebar } = UseUIStore();

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen, closeSidebar]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border/60 bg-card/40 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur lg:hidden">
        <Logo href="/admin" />
        <button
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          aria-expanded={sidebarOpen}
          className="flex items-center justify-center rounded-md p-2 text-foreground"
        >
          {sidebarOpen ? (
            <HiX className="h-5 w-5" />
          ) : (
            <HiMenu className="h-5 w-5" />
          )}
        </button>
      </header>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={closeSidebar}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border/60 bg-background lg:hidden">
            <SidebarContent onNavigate={closeSidebar} />
          </aside>
        </>
      )}
    </>
  );
}
