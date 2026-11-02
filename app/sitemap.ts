import type { MetadataRoute } from "next";

const base = "https://jsonlive.revandev.my.id";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: new Date("2026-11-02") },
    { url: `${base}/docs`, lastModified: new Date("2026-11-02") },
    { url: `${base}/policy`, lastModified: new Date("2026-10-01") },
  ];
}