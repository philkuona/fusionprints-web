import type { MetadataRoute } from "next";
import { SITE_URL, PUBLIC_ROUTES } from "@/lib/site";
import { getCatalog } from "@/lib/api/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/prints" || path === "/wall-art" ? 0.9 : 0.6,
  }));

  // Per-size product pages (all live under /prints/[size]). Best-effort: if the
  // catalog API is unreachable the static routes still ship.
  try {
    const catalog = await getCatalog();
    for (const p of catalog) {
      entries.push({
        url: `${SITE_URL}/prints/${p.sizeCode}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch {
    /* backend unavailable at build — static routes still indexed */
  }

  return entries;
}
