import Link from "next/link";
import type { ReactNode } from "react";
import { HiXMark } from "react-icons/hi2";
import { Background } from "@/components/layout/Background";
import { Logo } from "@/components/layout/Logo";

export function AuthShell({
  aside,
  children,
}: {
  aside: { heading: string; description: string };
  children: ReactNode;
}) {
  return (
    <>
      <Background />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-2xl backdrop-blur-md md:min-h-148">
          <Link
            href="/"
            aria-label="Exit to home"
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
          >
            <HiXMark className="h-5 w-5" />
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 md:min-h-148">
            <aside className="relative hidden flex-col justify-between border-r border-border/60 bg-linear-to-br from-primary/10 via-card to-background p-8 md:flex md:min-h-148">
              <Logo href="/" className="text-xl" />

              <div className="my-auto py-8">
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  {aside.heading}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {aside.description}
                </p>
              </div>

              <p className="text-xs text-muted-foreground/60">
                JSONLive API Platform
              </p>
            </aside>

            <div className="flex flex-col justify-center px-6 py-8 sm:px-8 md:min-h-148">
              <Logo href="/" className="mb-6 text-xl md:hidden" />
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
