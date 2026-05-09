import type { Metadata } from "next"
import Link from "next/link"
import PageShell from "@/components/PageShell"
import { getBlogsDataByCategory } from "../constants/blogs-data.service"

export const metadata: Metadata = {
  title: "India and its Poets",
  description: "A series on the poets, mystics, and wanderers who shaped India's literary and spiritual imagination — the ones most people have never heard of.",
  alternates: { canonical: "/blogs/india-and-its-poets" },
  openGraph: {
    title: "India and its Poets — Suraj Singh",
    description: "A series on the poets, mystics, and wanderers who shaped India's literary and spiritual imagination — the ones most people have never heard of.",
    url: "/blogs/india-and-its-poets",
    type: "website",
  },
}

const section = getBlogsDataByCategory("India and its Poets")

const IndiaAndItsPoetsPage = () => (
  <PageShell>
    <Link
      href="/blogs"
      className="text-xs font-medium tracking-widest uppercase text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors mb-4 inline-block"
    >
      ← All Blogs
    </Link>

    <h1 className="font-semibold text-2xl mb-1 tracking-tighter text-neutral-900 dark:text-neutral-100">
      India and its Poets
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

export default IndiaAndItsPoetsPage
