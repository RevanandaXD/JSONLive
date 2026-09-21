"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  HiOutlineChevronDown,
  HiOutlineDocumentText,
  HiOutlineGlobeAlt,
  HiOutlineCog6Tooth,
  HiOutlineChartBarSquare,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { HiMenu, HiX } from "react-icons/hi";
import { Logo } from "./Logo";
import { LoginButton } from "./LoginButton";
import { UseUIStore } from "@/stores/ui-store";
import { useSession, signOut } from "@/src/lib/auth-client";

const userLinks = [
  { name: "Dashboard", route: "/dashboard", icon: HiOutlineChartBarSquare },
  { name: "API Docs", route: "/docs", icon: HiOutlineDocumentText },
  { name: "Public APIs", route: "/public", icon: HiOutlineGlobeAlt },
  { name: "Settings", route: "/settings", icon: HiOutlineCog6Tooth },
];

const publicLinks = [
  { name: "Public APIs", route: "/public", icon: HiOutlineGlobeAlt },
  { name: "Docs", route: "/docs", icon: HiOutlineDocumentText },
];

export const DashboardNav = ({
  showUser = true,
  loginOnly = false,
}: {
  showUser?: boolean;
  loginOnly?: boolean;
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const { data, isPending } = useSession();
  const isLoggedIn = !!data?.user;

  const { sidebarOpen, toggleSidebar, closeSidebar } = UseUIStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const user = data?.user;
  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login"),
      },
    });
  };

  const isActive = (route: string) =>
    pathname === route ||
    (route === "/dashboard" && pathname.startsWith("/dashboard"));

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <div className="flex items-center gap-3">
          {/* Logged-in: user dropdown */}
          {isLoggedIn && showUser ? (
            <div ref={menuRef} className="relative hidden sm:block">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="User menu"
                aria-expanded={menuOpen}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-border/70 bg-card/60 px-3 text-sm font-medium text-foreground transition-colors hover:border-muted-foreground"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/15 text-xs font-bold text-primary">
                  {initial}
                </span>
                <span className="max-w-28 truncate">{displayName}</span>
                <HiOutlineChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 w-52 rounded-md border border-border/70 bg-background p-1 shadow-xl">
                  {userLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.route);

                    return (
                      <Link
                        key={link.name}
                        href={link.route}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2.5 rounded px-2.5 py-2 text-sm transition-colors ${
                          active
                            ? "bg-muted/60 font-semibold text-foreground"
                            : "font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {link.name}
                        {active && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    );
                  })}

                  <div className="my-1 border-t border-border/60" />

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            !isLoggedIn && (
              <nav className="hidden items-center gap-1 md:flex">
                {publicLinks.map((link) => {
                  const Icon = link.icon;
                  const active = pathname === link.route;

                  return (
                    <Link
                      key={link.name}
                      href={link.route}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium ${
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.name}
                    </Link>
                  );
                })}
                {loginOnly && <LoginButton className="ml-2" />}
              </nav>
            )
          )}

          {/* Mobile toggle */}
          <button
            className="flex cursor-pointer items-center justify-center rounded-md bg-transparent p-2 text-foreground md:hidden"
            onClick={() => toggleSidebar()}
            aria-label="Toggle menu"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? (
              <HiX className="h-5 w-5" />
            ) : (
              <HiMenu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => closeSidebar()}
          />
          <div className="relative z-40 border-t border-border/60 bg-background md:hidden">
            <div className="flex flex-col gap-3 px-4 py-4 sm:px-6">
              {isPending ? (
                <div className="h-4 w-24 animate-pulse rounded bg-muted/60" />
              ) : isLoggedIn && showUser ? (
                <>
                  <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-sm font-bold text-primary">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {displayName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <nav className="flex flex-col gap-1">
                    {userLinks.map((link) => {
                      const Icon = link.icon;
                      const active = isActive(link.route);

                      return (
                        <Link
                          key={link.name}
                          href={link.route}
                          onClick={() => closeSidebar()}
                          className={`flex items-center gap-2.5 rounded px-3 py-2.5 text-sm font-medium ${
                            active
                              ? "bg-muted/60 text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {link.name}
                        </Link>
                      );
                    })}
                  </nav>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 rounded px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                !isLoggedIn && (
                  <>
                    <nav className="flex flex-col gap-1">
                      {publicLinks.map((link) => {
                        const Icon = link.icon;
                        const active = pathname === link.route;

                        return (
                          <Link
                            key={link.name}
                            href={link.route}
                            onClick={() => closeSidebar()}
                            className={`flex items-center gap-2.5 rounded px-3 py-2.5 text-sm font-medium ${
                              active
                                ? "bg-muted/60 text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {link.name}
                          </Link>
                        );
                      })}
                    </nav>
                    {loginOnly && <LoginButton className="mt-1" />}
                  </>
                )
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};