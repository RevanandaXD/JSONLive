import type { MetadataRoute } from "next";

const base = "https://jsonlive.revandev.my.id";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: base,
      lastModified: new Date("2026-11-02"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/docs`,
      lastModified: new Date("2026-11-02"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/policy`,
      lastModified: new Date("2026-10-01"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/login`,
      lastModified: new Date("2026-11-02"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${base}/register`,
      lastModified: new Date("2026-11-02"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}