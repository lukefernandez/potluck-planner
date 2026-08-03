import { SITE_URL } from "@/shared/site";
import type { MetadataRoute } from "next";

// Build time stands in for last modification; the site redeploys on change.
const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-of-service`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
