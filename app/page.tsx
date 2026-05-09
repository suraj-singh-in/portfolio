import type { Metadata } from "next"
import HomeContent from '@/components/HomeContent'

export const metadata: Metadata = {
  title: "Suraj Singh — Software Engineer",
  description: "Suraj Singh is a software engineer based in Delhi. Nearly 4 years building offline-first retail systems, RAG pipelines, and developer tools — currently at Fynd.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Suraj Singh — Software Engineer",
    description: "Suraj Singh is a software engineer based in Delhi. Nearly 4 years building offline-first retail systems, RAG pipelines, and developer tools — currently at Fynd.",
    url: "/",
    type: "website",
  },
  twitter: {
    title: "Suraj Singh — Software Engineer",
    description: "Suraj Singh is a software engineer based in Delhi. Nearly 4 years building offline-first retail systems, RAG pipelines, and developer tools — currently at Fynd.",
  },
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Suraj Singh",
  url: "https://notasecondhandlife.com",
  jobTitle: "Software Development Engineer",
  worksFor: {
    "@type": "Organization",
    name: "Fynd (Shopsense Retail Technologies)",
    url: "https://fynd.com",
  },
  sameAs: [
    "https://linkedin.com/in/suraj-singh-in",
    "https://github.com/suraj-singh-in",
    "https://x.com/__SurajSingh__",
    "https://medium.com/@singh.suraj",
  ],
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Not a Second Hand Life",
  alternateName: "notasecondhandlife.com",
  url: "https://notasecondhandlife.com",
  author: {
    "@type": "Person",
    name: "Suraj Singh",
  },
  description: "Not a second hand life — writing on Indian history, philosophy, and software engineering by Suraj Singh.",
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeContent />
    </>
  )
}
