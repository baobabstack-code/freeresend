import type { MetadataRoute } from "next";
import { site } from "@/config/site";

const pages: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/launch-kit", changeFrequency: "monthly", priority: 0.7 },
  { path: "/deployment-review", changeFrequency: "monthly", priority: 0.7 },
  { path: "/tools/email-dns-checker", changeFrequency: "monthly", priority: 0.75 },
  { path: "/tools/ses-production-request-helper", changeFrequency: "monthly", priority: 0.74 },
  { path: "/guides/ses-production-readiness", changeFrequency: "monthly", priority: 0.72 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return pages.map((page) => ({
    url: `${site.url}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
