import type { MetadataRoute } from "next";

const PRIVATE_PATHS = [
  "/api/",
  "/dashboard/",
  "/upload/",
  "/settings/",
  "/onboarding/",
  "/import/",
  "/login",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rule
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      // AI search crawlers — explicitly allow
      { userAgent: "GPTBot", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "ChatGPT-User", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "ClaudeBot", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "PerplexityBot", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "Google-Extended", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "Applebot-Extended", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "Amazonbot", allow: "/", disallow: PRIVATE_PATHS },
      // Training-only crawlers — block
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
    ],
    sitemap: "https://www.viziai.app/sitemap.xml",
  };
}
