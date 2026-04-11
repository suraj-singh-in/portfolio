import type { Metadata } from "next"
import Listing from "@/components/ListingComponent";
import Link from "next/link";
import PageShell from "@/components/PageShell"

export const metadata: Metadata = {
  title: "Data Structures & Algorithms",
  description: "Notes on data structures and algorithms — recursion, complexity analysis, and core problem-solving patterns, written for clarity and long-term retention.",
  alternates: { canonical: "/compass/computer-science/data-structure-and-algorithms" },
  openGraph: {
    title: "Data Structures & Algorithms — Suraj Singh",
    description: "Notes on data structures and algorithms — recursion, complexity analysis, and core problem-solving patterns, written for clarity and long-term retention.",
    url: "/compass/computer-science/data-structure-and-algorithms",
    type: "website",
  },
  twitter: {
    title: "Data Structures & Algorithms — Suraj Singh",
    description: "Notes on data structures and algorithms — recursion, complexity analysis, and core problem-solving patterns, written for clarity and long-term retention.",
  },
}

const indexData = {
  sections: [
    {
      title: "Index",
      items: [
        {
          title: "Recursion",
          url: "/compass/computer-science/data-structure-and-algorithms/recursion",
        },
      ],
    },
  ],
};

const Index = () => (
  <PageShell>
    <header className="mb-8">
      <h1 className="font-semibold text-2xl tracking-tighter text-neutral-900 dark:text-neutral-100">Data Structures and Algorithms</h1>
    </header>
    <div className="flex flex-col gap-10">
      <Listing list={indexData} />
    </div>
  </PageShell>
);

export default Index;
