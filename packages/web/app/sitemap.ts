import { SITE_URL } from "@/shared/site";
import type { MetadataRoute } from "next";

// Dates of the last change to each page's content. Bump one by hand when that
// page's text changes; a build-time date would claim a change on every deploy,
// and search engines stop trusting a lastmod that is always "now".

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: "2026-09-03",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: "2026-08-03",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-of-service`,
      lastModified: "2026-08-03",
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
