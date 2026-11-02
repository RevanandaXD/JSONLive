import type { MetadataRoute } from "next";

const base = "https://jsonlive.revandev.my.id";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs", "/policy", "/login", "/register"],
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/resources/",
          "/settings",
          "/admin",
          "/api/",
          "/thanks",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
