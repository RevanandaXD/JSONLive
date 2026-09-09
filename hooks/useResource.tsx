"use client";

import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Resource } from "@/types/resource";

export default function useResource() {
    const result = useQuery({
        queryKey: ['resources'],
        queryFn: () => api.get<Resource[]>('/api/resources')
    })

    return{
        data: result.data,
        isPending: result.isPending,
        isError: result.isError
    }
}