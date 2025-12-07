import Listing, { IList } from "@/components/ListingComponent";

const blogsData: IList = {
  sections: [
    {
      title: "Computer Science",
      items: [
        {
          title: "Web Workers vs Service Workers — When to Use What?",
          url: "/blogs/computer-science/web-workers-vs-service-workers-when-to-use-what",
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
  <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="mb-8">
      <h1 className="font-semibold text-2xl tracking-tighter text-neutral-900 dark:text-neutral-100">Blogs</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-3 text-sm font-medium">By Suraj Singh</p>
    </header>

    <div className="flex flex-col gap-10">
      <Listing list={blogsData} />
    </div>
  </section>
);

export default Blogs;
