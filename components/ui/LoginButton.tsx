"use client";

import Link from "next/link";
import { useSession } from "@/src/lib/auth-client";

export const LoginButton = ({ className = "" }: { className?: string }) => {
  const { data, isPending } = useSession();

  if (isPending) {
    return (
      <span
        className={`h-8 w-16 animate-pulse rounded-lg bg-muted/60 ${className}`}
      />
    );
  }

  if (data?.user) return null;

  return (
    <Link
      href="/login"
      className={`inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background transition-colors hover:bg-primary-hover ${className}`}
    >
      Log in
    </Link>
  );
};