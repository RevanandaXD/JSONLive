import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Resource } from "@/types/resource";
import { api } from "@/src/lib/api";

interface CreateResourceInput {
  name: string;
  data: unknown;
  published?: boolean;
  private?: boolean;
}

export const useCreateResources = () => {
  const queryClient = useQueryClient();
  const createResource = useMutation({
    mutationFn: (input: CreateResourceInput) =>
      api.post<{ status: number; data: Resource }>("/api/resources", input).then((res) => res.data),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["resources"],
      }),
  });

  return {
    createResource: createResource.mutateAsync,
    isPending: createResource.isPending,
    isError: createResource.isError,
    error: createResource.error,
  };
};
