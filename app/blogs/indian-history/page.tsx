import type { Metadata } from "next"
import Link from "next/link"
import PageShell from "@/components/PageShell"
import { getBlogsDataByCategory } from "../constants/blogs-data.service"

export const metadata: Metadata = {
  title: "India and its History",
  description: "Essays on Indian history — the people, events, and ideas that shaped the subcontinent, told without the textbook distance.",
  alternates: { canonical: "/blogs/indian-history" },
  openGraph: {
    title: "India and its History — Suraj Singh",
    description: "Essays on Indian history — the people, events, and ideas that shaped the subcontinent, told without the textbook distance.",
    url: "/blogs/indian-history",
    type: "website",
  },
}

const section = getBlogsDataByCategory("Indian History")

const IndianHistoryPage = () => (
  <PageShell>
    <Link
      href="/blogs"
      className="text-xs font-medium tracking-widest uppercase text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors mb-4 inline-block"
    >
      ← All Blogs
    </Link>

    <h1 className="font-semibold text-2xl mb-1 tracking-tighter text-neutral-900 dark:text-neutral-100">
      India and its History
    </h1>
    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">{section.subtitle}</p>

    <div className="flex flex-col gap-8">
      {section.items.map((post) => (
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

export default IndianHistoryPage
