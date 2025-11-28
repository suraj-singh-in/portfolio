import Link from "next/link";

const blogsData = {
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
} as const;

const Blogs = () => (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="mb-8">
            <h1 className="font-semibold text-2xl tracking-tighter text-neutral-900 dark:text-neutral-100">
                Blogs
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-3 text-sm font-medium">By Suraj Singh</p>
        </header>

        <div className="flex flex-col gap-10">
            {blogsData.sections.map((section) => (
                <div key={section.title} className="flex flex-col">
                    <div className="flex justify-between items-baseline mb-2">
                        <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">
                            {section.title}
                        </h2>
                    </div>

                    <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm">
                        {section.items.map((item) => {
                            const isExternal = item.url.startsWith('http');
                            return (
                                <li key={item.url} className="font-medium">
                                    {isExternal ? (
                                        <a
                                            href={item.url}
                                            className="underline"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {item.title}
                                        </a>
                                    ) : (
                                        <Link
                                            href={item.url}
                                            className="underline"
                                        >
                                            {item.title}
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                    {/* divider between sections */}
                    <hr className="my-4 border-neutral-100 dark:border-neutral-800" />
                </div>
            ))}
        </div>
    </section>
);

export default Blogs;
