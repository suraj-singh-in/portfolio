import type { Metadata } from "next"
import type { IList } from "@/components/ListingComponent"
import PageShell from "@/components/PageShell"
import BlogSearch from "@/components/BlogSearch"

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

const blogsData: IList = {
  sections: [
    {
      title: "Computer Science",
      items: [
        {
          title: "Building a Cross-Frame SDK for POS Extensions",
          url: "/blogs/computer-science/building-a-cross-frame-sdk-for-pos-extensions",
        },
        {
          title: "Building an Offline-First Architecture for a Retail POS",
          url: "/blogs/computer-science/offline-first-architecture-in-retail-pos",
        },
        {
          title: "Web Workers vs Service Workers — When to Use What?",
          url: "/blogs/computer-science/web-workers-vs-service-workers-when-to-use-what",
        },
      ],
    },
    {
      title: "India and its Poets",
      items: [
        {
          title: "Sarmad Kashani — The Man Who Refused to Finish a Prayer",
          url: "/blogs/india-and-its-poets/sarmad-kashani-the-man-who-refused-to-finish-a-prayer",
        },
      ],
    },
    {
      title: "Philosophy",
      items: [
        {
          title: "Eyes on Eternity: Exploring Jordan Peterson’s Narrative on God",
          url: "https://medium.com/@singh.suraj/eyes-on-eternity-exploring-jordan-petersons-narrative-on-god-e491794a158",
        },
      ],
    },
    {
      title: "Book Review",
      items: [
        {
          title: "Dune by Frank Herbert: 5 Point Book Review",
          url: "https://medium.com/@singh.suraj/dune-by-frank-herbert-5-point-book-review-cc637d66b3d8",
        },
        {
          title: "400 Days by Chetan Bhagat: 5 Point Book Review",
          url: "https://medium.com/@singh.suraj/400-days-by-chetan-bhagat-5-point-book-review-5c4a05df47f0",
        },
      ],
    },
  ],
};

const Blogs = () => (
  <PageShell>
    <BlogSearch list={blogsData} />
  </PageShell>
);

export default Blogs;
