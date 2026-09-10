"use client";

import { api } from "@/src/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Resource } from "@/types/resource";

export default function useResource() {
  const result = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const res = await api.get<{ status: number; data: Resource[] }>("/api/resources");
      return res.data;
    },
  });

  return {
    data: result.data,
    isPending: result.isPending,
    isError: result.isError,
    refetch: result.refetch,
  };
}
