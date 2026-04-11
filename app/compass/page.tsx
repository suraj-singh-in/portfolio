import type { Metadata } from "next"
import Listing, { IList } from "@/components/ListingComponent";
import PageShell from "@/components/PageShell"

export const metadata: Metadata = {
  title: "Compass",
  description: "A personal knowledge bank — structured notes on computer science, algorithms, and systems built while learning and teaching simultaneously.",
  alternates: { canonical: "/compass" },
  openGraph: {
    title: "Compass — Suraj Singh",
    description: "A personal knowledge bank — structured notes on computer science, algorithms, and systems built while learning and teaching simultaneously.",
    url: "/compass",
    type: "website",
  },
  twitter: {
    title: "Compass — Suraj Singh",
    description: "A personal knowledge bank — structured notes on computer science, algorithms, and systems built while learning and teaching simultaneously.",
  },
}

const indexData: IList = {
  sections: [
    {
      title: "Computer Science",
      items: [
        {
          title: "Data Structures and Algorithms",
          url: "/compass/computer-science/data-structure-and-algorithms",
        },
      ],
    },
  ],
};

const Compass = () => (
  <PageShell>
    <header className="mb-8">
      <h1 className="font-semibold text-2xl tracking-tighter text-neutral-900 dark:text-neutral-100">Compass</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-3 text-sm font-medium">a knowledge bank</p>
    </header>
    <div className="flex flex-col gap-10">
      <Listing list={indexData} />
    </div>
  </PageShell>
);

export default Compass;
