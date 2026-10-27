import type { MetadataRoute } from "next";

const base = "https://jsonlive.revandev.my.id";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/docs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}