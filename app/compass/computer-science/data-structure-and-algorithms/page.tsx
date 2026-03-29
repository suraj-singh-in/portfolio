import Listing from "@/components/ListingComponent";
import Link from "next/link";
import PageShell from "@/components/PageShell"

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
