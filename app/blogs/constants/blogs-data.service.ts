import type { IList, ISection } from "@/components/ListingComponent"

export const blogsData: IList = {
    sections: [
        {
            title: "Computer Science",
            categoryUrl: "/blogs/computer-science",
            subtitle: "Engineering writing on browser APIs, offline-first architecture, developer tooling, and the decisions behind production systems.",
            items: [
                {
                    title: "Building a Cross-Frame SDK for POS Extensions",
                    url: "/blogs/computer-science/building-a-cross-frame-sdk-for-pos-extensions",
                    description: "How I designed FSI — a small JavaScript SDK that creates a two-way communication channel between a host POS application and independently deployed extension iframes.",
                    date: "April 2026",
                },
                {
                    title: "Building an Offline-First Architecture for a Retail POS",
                    url: "/blogs/computer-science/offline-first-architecture-in-retail-pos",
                    description: "A deep-dive into the layered offline system powering StoreOS — service workers, IndexedDB, web workers, state machines, and a POS that never goes down.",
                    date: "April 2026",
                },
                {
                    title: "Web Workers vs Service Workers — When to Use What?",
                    url: "/blogs/computer-science/web-workers-vs-service-workers-when-to-use-what",
                    description: "A concise engineering guide comparing Web Workers and Service Workers — their roles, key differences, and when to reach for each in production applications.",
                    date: "November 2025",
                },
            ],
        },
        {
            title: "Indian History",
            categoryUrl: "/blogs/indian-history",
            subtitle: "The people, events, and ideas that shaped the subcontinent — told without the textbook distance.",
            items: [
                {
                    episode: "Episode 002",
                    title: "Raja Ravi Varma — The Man Who Gave India Its Gods",
                    url: "/blogs/indian-history/raja-ravi-varma-the-man-who-gave-india-its-gods",
                    description: "A painter from Kerala who combined European oil technique with Hindu mythology and accidentally defined how an entire civilization visualizes its own gods.",
                    date: "April 2026",
                },
                {
                    episode: "Episode 001",
                    title: "The Jews of Kerala — 1,500 Years of a Story Nobody Tells",
                    url: "/blogs/indian-history/the-jews-of-kerala-1500-years-of-a-story-nobody-tells",
                    description: "In 70 AD, Jews fleeing the destruction of the Second Temple found safety on the coast of Kerala. They stayed for 1,500 years — until the Portuguese arrived.",
                    date: "April 2026",
                },
            ],
        },
        {
            title: "India and its Poets",
            categoryUrl: "/blogs/india-and-its-poets",
            subtitle: "The poets, mystics, and wanderers who shaped India’s literary and spiritual imagination — the ones most people have never heard of.",
            items: [
                {
                    episode: "Episode 001",
                    title: "Sarmad Kashani — The Man Who Refused to Finish a Prayer",
                    url: "/blogs/india-and-its-poets/sarmad-kashani-the-man-who-refused-to-finish-a-prayer",
                    description: "A Jewish merchant from Persia who gave away everything, wandered naked through Mughal Delhi, and was beheaded for refusing to complete a sentence.",
                    date: "April 2026",
                },
            ],
        },
        {
            title: "Philosophy",
            categoryUrl: "/blogs/philosophy",
            subtitle: "Thinkers who make you uncomfortable, ideas that don’t resolve cleanly, and the question of whether you are actually thinking.",
            items: [
                {
                    episode: "Episode 001",
                    title: "Jiddu Krishnamurti — On Being a Second-Hand Person",
                    url: "/blogs/philosophy/jiddu-krishnamurti-on-being-a-secondhand-person",
                    description: "Krishnamurti had one argument. He made it for sixty years. The argument was: you are not thinking. You are repeating.",
                    date: "May 2026",
                },
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

export const getBlogsData = (): IList => blogsData;

export const getBlogsDataByCategory = (category: string): ISection => {
    return blogsData.sections.find((section) => section.title === category) || {
        title: category,
        items: [],
    };
}; 