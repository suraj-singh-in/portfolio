import type { Metadata } from "next"
import HomeContent from '@/components/HomeContent'

export const metadata: Metadata = {
  title: "Suraj Singh — Software Engineer",
  description: "Software engineer with nearly 4 years of full-stack experience. Currently at Fynd building offline-first retail systems with React, Next.js, and Node.js.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Suraj Singh — Software Engineer",
    description: "Software engineer with nearly 4 years of full-stack experience. Currently at Fynd building offline-first retail systems with React, Next.js, and Node.js.",
    url: "/",
    type: "website",
  },
  twitter: {
    title: "Suraj Singh — Software Engineer",
    description: "Software engineer with nearly 4 years of full-stack experience. Currently at Fynd building offline-first retail systems with React, Next.js, and Node.js.",
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
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <HomeContent />
    </>
  )
}
