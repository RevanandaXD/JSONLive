"use client";

import { useSession } from "@/src/lib/auth-client";

export const useUser = () => {
  const { data, isPending, error } = useSession();

  return {
    user: data?.user ?? null,
    session: data?.session ?? null,
    isPending,
    error,
  };
};