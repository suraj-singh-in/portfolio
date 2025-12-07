import Listing from "@/components/ListingComponent";
import Link from "next/link";

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
  <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="mb-8">
      <h1 className="font-semibold text-2xl tracking-tighter text-neutral-900 dark:text-neutral-100">Data Structures and Algorithms</h1>
    </header>
    <div className="flex flex-col gap-10">
      <Listing list={indexData} />
    </div>
  </section>
);

export default Index;
