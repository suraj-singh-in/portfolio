import type { Metadata } from "next"
import PageShell from "@/components/PageShell"
import BlogSearch from "@/components/BlogSearch"
import { getBlogsData } from "./constants/blogs-data.service"

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing on computer science, philosophy, and books — from browser APIs and service workers to Dostoevsky, with an engineering perspective throughout.",
  alternates: { canonical: "/blogs" },
  openGraph: {
    title: "Blog — Suraj Singh",
    description: "Writing on computer science, philosophy, and books — from browser APIs and service workers to Dostoevsky, with an engineering perspective throughout.",
    url: "/blogs",
    type: "website",
  },
  twitter: {
    title: "Blog — Suraj Singh",
    description: "Writing on computer science, philosophy, and books — from browser APIs and service workers to Dostoevsky, with an engineering perspective throughout.",
  },
}


const Blogs = () => (
  <PageShell>
    <BlogSearch list={getBlogsData()} />
  </PageShell>
);  

export default Blogs;
