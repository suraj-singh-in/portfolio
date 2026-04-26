import type { Metadata } from "next"
import Link from "next/link"
import PageShell from "@/components/PageShell"

export const metadata: Metadata = {
  title: "Computer Science — Blog",
  description: "Engineering writing on browser APIs, offline-first architecture, developer tooling, and the decisions behind production systems.",
  alternates: { canonical: "/blogs/computer-science" },
  openGraph: {
    title: "Computer Science — Suraj Singh",
    description: "Engineering writing on browser APIs, offline-first architecture, developer tooling, and the decisions behind production systems.",
    url: "/blogs/computer-science",
    type: "website",
  },
}

const posts = [
  {
    title: "Building a Cross-Frame SDK for POS Extensions",
    description: "How I designed FSI — a small JavaScript SDK that creates a two-way communication channel between a host POS application and independently deployed extension iframes.",
    url: "/blogs/computer-science/building-a-cross-frame-sdk-for-pos-extensions",
    date: "April 2026",
  },
  {
    title: "Building an Offline-First Architecture for a Retail POS",
    description: "A deep-dive into the layered offline system powering StoreOS — service workers, IndexedDB, web workers, state machines, and a POS that never goes down.",
    url: "/blogs/computer-science/offline-first-architecture-in-retail-pos",
    date: "April 2026",
  },
  {
    title: "Web Workers vs Service Workers — When to Use What?",
    description: "A concise engineering guide comparing Web Workers and Service Workers — their roles, key differences, and when to reach for each in production applications.",
    url: "/blogs/computer-science/web-workers-vs-service-workers-when-to-use-what",
    date: "November 2025",
  },
]

const ComputerSciencePage = () => (
  <PageShell>
    <Link
      href="/blogs"
      className="text-xs font-medium tracking-widest uppercase text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors mb-4 inline-block"
    >
      ← All Blogs
    </Link>

    <h1 className="font-semibold text-2xl mb-1 tracking-tighter text-neutral-900 dark:text-neutral-100">
      Computer Science
    </h1>
    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">
      Engineering writing on browser APIs, offline-first architecture, developer tooling, and the decisions behind production systems.
    </p>

    <div className="flex flex-col gap-8">
      {posts.map((post) => (
        <div key={post.url} className="flex flex-col gap-1">
          <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
            {post.date}
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

export default ComputerSciencePage
