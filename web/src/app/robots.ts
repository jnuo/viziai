import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/upload/", "/settings/"],
    },
    sitemap: "https://www.viziai.app/sitemap.xml",
  };
}
