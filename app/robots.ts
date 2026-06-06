import type { MetadataRoute } from "next";
import { SITE_URL, PRIVATE_PREFIXES } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep account/app flows out of the index.
      disallow: PRIVATE_PREFIXES.map((p) => `${p}/`),
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
