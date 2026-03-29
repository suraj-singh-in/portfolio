import Listing, { IList } from "@/components/ListingComponent";
import PageShell from "@/components/PageShell"

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
      <h1 className="font-semibold text-2xl tracking-tighter text-neutral-900 dark:text-neutral-100">Campass</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-3 text-sm font-medium">a knowledge bank</p>
    </header>
    <div className="flex flex-col gap-10">
      <Listing list={indexData} />
    </div>
  </PageShell>
);

export default Compass;
