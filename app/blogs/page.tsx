import PageShell from "@/components/PageShell"
import BlogSearch from "@/components/BlogSearch"
import { getBlogsData } from "./constants/blogs-data.service"
import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Blog — Suraj Singh",
  description: "Writing on computer science, philosophy, and books — from browser APIs and service workers to Dostoevsky, with an engineering perspective throughout.",
  path: "/blogs",
})


const Blogs = () => (
  <PageShell>
    <BlogSearch list={getBlogsData()} />
  </PageShell>
);  

export default Blogs;
