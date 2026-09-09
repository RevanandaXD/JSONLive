"use client";

import { useQuery } from "@tanstack/react-query";

export default function useResource() {
    const result = useQuery({
        queryKey: ['resources'],
        queryFn: async () => {
            const res = await fetch('/api/resources');

            if (!res.ok) throw new Error("Failed to fetch resources");
            
            return res.json()
        }
    })

    return{
        data: result.data,
        isPending: result.isPending,
        isError: result.isError
    }
}