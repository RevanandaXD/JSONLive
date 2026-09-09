import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Resource } from "@/types/resource";
import { api } from "@/lib/api";

interface CreateResourceInput {
    name: string,
    data: unknown,
}

export const useCreateResources = () => {
    const queryClient = useQueryClient()
    const createResource = useMutation({
        mutationFn: (input: CreateResourceInput) => api.post<Resource>('/api/resources', input),

        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['resources']
        })
    })


    
    return {
        createResource: createResource.mutate,
        isPending: createResource.isPending,
        isError: createResource.isError,
    }
}
