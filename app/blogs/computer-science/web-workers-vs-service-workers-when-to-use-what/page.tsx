import type { Metadata } from "next"
import PageShell from "@/components/PageShell"

export const metadata: Metadata = {
  title: "Web Workers vs Service Workers — When to Use What?",
  description: "A concise engineering guide comparing Web Workers and Service Workers — their roles, key differences, and when to reach for each in production applications.",
  alternates: { canonical: "/blogs/computer-science/web-workers-vs-service-workers-when-to-use-what" },
  authors: [{ name: "Suraj Singh" }],
  keywords: ["Web Workers", "Service Workers", "browser APIs", "IndexedDB", "offline-first", "React performance"],
  openGraph: {
    title: "Web Workers vs Service Workers — When to Use What?",
    description: "A concise engineering guide comparing Web Workers and Service Workers — their roles, key differences, and when to reach for each in production applications.",
    url: "/blogs/computer-science/web-workers-vs-service-workers-when-to-use-what",
    type: "article",
    siteName: "Suraj Singh",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Web Workers vs Service Workers — Suraj Singh" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Workers vs Service Workers — When to Use What?",
    description: "A concise engineering guide comparing Web Workers and Service Workers — their roles, key differences, and when to reach for each in production applications.",
    creator: "@__SurajSingh__",
    images: ["/opengraph-image"],
  },
}

const WebWorkersVsServiceWorkers = () => (
    <PageShell>

        {/* Structured Data for SEO */}
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    headline: "Web Workers vs Service Workers — When to Use What?",
                    description: "A concise engineering guide comparing Web Workers and Service Workers — their roles, key differences, and when to reach for each in production applications.",
                    url: "https://portfolio-ivory-gamma-65.vercel.app/blogs/computer-science/web-workers-vs-service-workers-when-to-use-what",
                    datePublished: "2025-11-28",
                    dateModified: "2025-11-28",
                    author: {
                        "@type": "Person",
                        name: "Suraj Singh",
                        url: "https://portfolio-ivory-gamma-65.vercel.app",
                    },
                    mainEntityOfPage: {
                        "@type": "WebPage",
                        "@id": "https://portfolio-ivory-gamma-65.vercel.app/blogs/computer-science/web-workers-vs-service-workers-when-to-use-what",
                    },
                }),
            }}
        />

        {/* BLOG CONTENT */}
        <h1 className="font-semibold text-2xl mb-8 tracking-tighter text-neutral-900 dark:text-neutral-100">
            Web Workers vs Service Workers — When to Use What?
        </h1>

        <div className="flex flex-col gap-6 text-neutral-700 dark:text-neutral-300 leading-relaxed">

            <p>
                Modern web applications demand performance and resilience. Two browser technologies — Web Workers
                and Service Workers — enable background processing and offline capabilities, but they serve
                fundamentally different purposes.
            </p>

            <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">Core Difference</h2>

            <table className="w-full text-sm border-collapse border border-neutral-300 dark:border-neutral-700">
                <thead>
                    <tr className="bg-neutral-200 dark:bg-neutral-800">
                        <th className="border px-3 py-2">Feature</th>
                        <th className="border px-3 py-2">Web Workers</th>
                        <th className="border px-3 py-2">Service Workers</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border px-3 py-2">Primary Purpose</td>
                        <td className="border px-3 py-2">Heavy computation</td>
                        <td className="border px-3 py-2">Network control & offline caching</td>
                    </tr>
                    <tr>
                        <td className="border px-3 py-2">Runs When?</td>
                        <td className="border px-3 py-2">Only when app is open</td>
                        <td className="border px-3 py-2">Even when app is closed</td>
                    </tr>
                    <tr>
                        <td className="border px-3 py-2">Use Cases</td>
                        <td className="border px-3 py-2">CPU tasks, JSON parsing</td>
                        <td className="border px-3 py-2">Offline, caching, push notifications</td>
                    </tr>
                </tbody>
            </table>

            <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">When to Use Web Workers</h2>
            <p>Use Web Workers when the UI must remain responsive during heavy computation.</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Data processing</li>
                <li>Image/audio manipulation</li>
                <li>Large-file parsing</li>
                <li>Mathematical computations</li>
            </ul>

            <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
                {`const worker = new Worker("worker.js");
worker.postMessage(data);
worker.onmessage = (e) => console.log(e.data);`}
            </pre>

            <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">When to Use Service Workers</h2>
            <p>Service Workers function as a proxy layer between browser and network, ideal for offline-first apps.</p>
            <ul className="list-disc pl-5 space-y-1">
                <li>Caching & Asset Management</li>
                <li>Background Sync</li>
                <li>Push Notifications</li>
                <li>Retry Mechanisms</li>
            </ul>

            <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
                {`self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
});`}
            </pre>

            <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
            <p className="text-sm">
                Web Workers improve computation performance. <br />
                Service Workers improve application resilience. <br />
                Scalable systems often use both.
            </p>

        </div>
    </PageShell>
);

export default WebWorkersVsServiceWorkers;
