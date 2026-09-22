"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiKey } from "@/types/api-key";
import { api } from "@/src/lib/api";

interface CreateApiKeyInput {
  name: string;
  expiresAt?: string | null;
}

export default function useApiKeys() {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      try {
        const res = await api.get<{ status: number; data: ApiKey[] }>("/api/api-keys");
        return res.data ?? [];
      } catch {
        return [];
      }
    },
  });

  const createKey = useMutation({
    mutationFn: (input: CreateApiKeyInput) =>
      api
        .post<{ status: number; data: ApiKey }>("/api/api-keys", input)
        .then((res) => res.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["api-keys"] }),
  });

  const deleteKey = useMutation({
    mutationFn: (id: string) =>
      api.delete<{ status: number; data: { success: boolean } }>(`/api/api-keys/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["api-keys"] }),
  });

  return {
    data: result.data ?? [],
    isPending: result.isPending,
    isError: result.isError,
    refetch: result.refetch,
    createKey: createKey.mutateAsync,
    isCreating: createKey.isPending,
    createError: createKey.error,
    deleteKey: deleteKey.mutateAsync,
    isDeleting: deleteKey.isPending,
  };
}