import type { MetadataRoute } from "next"

const BASE_URL = "https://portfolio-ivory-gamma-65.vercel.app"

// Static public routes — exclude /credits (non-content utility page)
const staticRoutes: { path: string; priority: number }[] = [
  { path: "/", priority: 1.0 },
  { path: "/experience", priority: 0.8 },
  { path: "/projects", priority: 0.8 },
  { path: "/blogs", priority: 0.8 },
  { path: "/compass", priority: 0.7 },
  { path: "/manhattan-project", priority: 0.7 },
  { path: "/compass/computer-science/data-structure-and-algorithms", priority: 0.6 },
  { path: "/compass/computer-science/data-structure-and-algorithms/recursion", priority: 0.6 },
]

// Blog/writing posts — add new entries here as posts are published
const blogPosts: { path: string; lastModified: string }[] = [
  {
    path: "/blogs/india-and-its-poets/sarmad-kashani-the-man-who-refused-to-finish-a-prayer",
    lastModified: "2026-04-19",
  },
  {
    path: "/blogs/computer-science/building-a-cross-frame-sdk-for-pos-extensions",
    lastModified: "2026-04-11",
  },
  {
    path: "/blogs/computer-science/offline-first-architecture-in-retail-pos",
    lastModified: "2026-04-11",
  },
  {
    path: "/blogs/computer-science/web-workers-vs-service-workers-when-to-use-what",
    lastModified: "2025-11-28",
  },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString().split("T")[0]

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority,
  }))

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map(({ path, lastModified }) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency: "never",
    priority: 0.9,
  }))

  return [...staticEntries, ...blogEntries]
}
