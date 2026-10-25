import type { MetadataRoute } from "next";

type Route = {
    path: string,
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never",
    priority: number
}

export default function sitemap(): MetadataRoute.Sitemap {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "https://jsonlive.revandev.my.id"

    const routes: Route[] = [
        { path: '', changeFrequency: 'daily', priority: 1.0 },
        { path: '/docs', changeFrequency: 'weekly', priority: 0.9 },
        { path: '/public', changeFrequency: 'daily', priority: 0.8 },
        { path: '/policy', changeFrequency: 'monthly', priority: 0.5 },
    ]

    return routes.map((route) => ({
        url: `${baseURL}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority
    }))
}