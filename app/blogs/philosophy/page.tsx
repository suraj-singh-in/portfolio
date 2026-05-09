import type { Metadata } from "next"
import Link from "next/link"
import PageShell from "@/components/PageShell"
import { getBlogsDataByCategory } from "../constants/blogs-data.service"

export const metadata: Metadata = {
  title: "Philosophy — Suraj Singh",
  description: "Writing on philosophy — thinkers who make you uncomfortable, ideas that don't resolve cleanly, and the question of whether you are actually thinking.",
  alternates: { canonical: "/blogs/philosophy" },
  openGraph: {
    title: "Philosophy — Suraj Singh",
    description: "Writing on philosophy — thinkers who make you uncomfortable, ideas that don't resolve cleanly, and the question of whether you are actually thinking.",
    url: "/blogs/philosophy",
    type: "website",
  },
}

const section = getBlogsDataByCategory("Philosophy")
const localPosts = section.items.filter((p) => !p.url.startsWith("http"))

const PhilosophyPage = () => (
  <PageShell>
    <Link
      href="/blogs"
      className="text-xs font-medium tracking-widest uppercase text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors mb-4 inline-block"
    >
      ← All Blogs
    </Link>

    <h1 className="font-semibold text-2xl mb-1 tracking-tighter text-neutral-900 dark:text-neutral-100">
      Philosophy
    </h1>
    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">{section.subtitle}</p>

    <div className="flex flex-col gap-8">
      {localPosts.map((post) => (
        <div key={post.url} className="flex flex-col gap-1">
          <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
            {post.episode ? `${post.episode} · ` : ""}{post.date}
          </p>
          <Link
            href={post.url}
            className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline leading-snug"
          >
            {post.title}
          </Link>
          {post.description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {post.description}
            </p>
          )}
        </div>
      ))}
    </div>
  </PageShell>
)

export default PhilosophyPage
