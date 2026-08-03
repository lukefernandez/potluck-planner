import { SITE_URL } from "@/shared/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Potluck pages show guests' names and are worth nothing in search, so
      // the goal is that crawlers never read them — not that they rank badly.
      //
      // This does cost something. A crawler that cannot fetch the page cannot
      // read the noindex on it either, so a slug linked from somewhere public
      // can still surface as a bare url. What it cannot surface is any of the
      // content, because that was never fetched. Between a url with no names
      // and a crawler that has read every name, the url is the better failure.
      //
      // If one ever does show up (Search Console reports it as "Indexed,
      // though blocked by robots.txt"), lift this line long enough for the
      // noindex to be read, then put it back.
      disallow: "/potluck/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
