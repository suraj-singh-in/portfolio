import type { Metadata } from "next"
import Link from "next/link"
import PageShell from "@/components/PageShell"

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

const posts = [
  {
    episode: "Episode 002",
    title: "Raja Ravi Varma — The Man Who Gave India Its Gods",
    description: "A painter from Kerala who combined European oil technique with Hindu mythology and accidentally defined how an entire civilization visualizes its own gods.",
    url: "/blogs/indian-history/raja-ravi-varma-the-man-who-gave-india-its-gods",
    date: "April 2026",
  },
  {
    episode: "Episode 001",
    title: "The Jews of Kerala — 1,500 Years of a Story Nobody Tells",
    description: "In 70 AD, Jews fleeing the destruction of the Second Temple found safety on the coast of Kerala. They stayed for 1,500 years — until the Portuguese arrived.",
    url: "/blogs/indian-history/the-jews-of-kerala-1500-years-of-a-story-nobody-tells",
    date: "April 2026",
  },
]

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
    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">
      The people, events, and ideas that shaped the subcontinent — told without the textbook distance.
    </p>

    <div className="flex flex-col gap-8">
      {posts.map((post) => (
        <div key={post.url} className="flex flex-col gap-1">
          <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
            {post.episode} · {post.date}
          </p>
          <Link
            href={post.url}
            className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline leading-snug"
          >
            {post.title}
          </Link>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {post.description}
          </p>
        </div>
      ))}
    </div>
  </PageShell>
)

export default IndianHistoryPage
