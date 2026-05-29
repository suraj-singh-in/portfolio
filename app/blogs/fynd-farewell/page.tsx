import Image from "next/image"
import Link from "next/link"
import PageShell from "@/components/PageShell"
import { articleMetadata } from "@/lib/metadata"

export const metadata = articleMetadata({
  title: "FarewellFynd — Before I Disappear from Slack",
  description: "A farewell note to the team before becoming 'last seen long ago'.",
  path: "/blogs/farewell-fynd",
  keywords: ["farewell", "goodbye", "Fynd", "team"],
  ogImageAlt: "FarewellFynd",
})

const FarewellFynd = () => (
  <PageShell>

    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "FarewellFynd — Before I Disappear from Slack",
          description: "A farewell note to the team before becoming 'last seen long ago'.",
          url: "https://notasecondhandlife.com/blogs/farewell-fynd",
          datePublished: "2026-05-29",
          dateModified: "2026-05-29",
          author: {
            "@type": "Person",
            name: "Suraj Singh",
            url: "https://notasecondhandlife.com",
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://notasecondhandlife.com/blogs/farewell-fynd",
          },
        }),
      }}
    />

    {/* Label */}
    <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-4 inline-block">
      Farewell Note
    </p>

    <h1 className="font-semibold text-2xl mb-2 tracking-tighter text-neutral-900 dark:text-neutral-100">
      FarewellFynd
    </h1>
    <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-10">29 May 2026 · 2 min read</p>

    <div className="flex flex-col gap-5 text-neutral-700 dark:text-neutral-300 leading-relaxed">

      <p className="italic text-neutral-500 dark:text-neutral-400">
        Before I disappear from Slack and become &ldquo;last seen long ago&rdquo;&hellip;
      </p>

      <p>Just wanted to say goodbye to this beautiful circus.</p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      {/* Gaurav */}
      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">
        Gaurav bhai
      </h2>

      <p>
        Every time something broke, production caught fire, or panic started spreading — you were always like:
      </p>

      <blockquote className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 italic text-neutral-600 dark:text-neutral-400">
        &ldquo;Mera baccha hai tu… dhurandar hai dhurandar.&rdquo;
      </blockquote>

      <p>
        Thank you for always backing the team and somehow keeping everyone sane.
      </p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      {/* Android & iOS */}
      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">
        Android &amp; iOS — Chandan, Azim, Dheeraj, Rausaon
      </h2>

      <p>
        After all the platform wars, endless debates, and &ldquo;works on my device&rdquo; moments&hellip;
      </p>

      <p>Turns out web won in the end.</p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      {/* Mithali */}
      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">
        Mithali
      </h2>

      <p>
        Every time a new task came in — no matter how complicated or impossible it sounded — your instant reaction was:
      </p>

      <blockquote className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 italic text-neutral-600 dark:text-neutral-400">
        &ldquo;Mast plan hai.&rdquo;
      </blockquote>

      <p>Meanwhile the rest of us were still trying to understand the requirement.</p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      {/* Vivek, Yash, Lokesh */}
      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">
        Vivek, Yash, Lokesh
      </h2>

      <p>Pure &ldquo;bhai bhai&rdquo; cinematic universe.</p>

      <p>Half the conversations were work. The other half were random nonsense and memes.</p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      {/* QA */}
      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">
        The QA Team
      </h2>

      <p>
        You blocked builds harder than Thakur blocked Gabbar&apos;s happiness.
      </p>

      <p>
        But genuinely — thank you for saving us from shipping disasters every single sprint.
      </p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      {/* Special mentions */}
      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">
        Special Mentions
      </h2>

      <p>
        Jalak and everyone else I annoyed daily with pings, calls, follow-ups, &ldquo;quick syncs&rdquo; that were never quick, and random memes.
      </p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <p>
        I&apos;ll genuinely miss the chaos, the people, the inside jokes, the production panics, and all the small moments in between.
      </p>

      <p>Thank you everyone for making this journey memorable.</p>

      <p className="italic text-neutral-500 dark:text-neutral-400">
        Until next time&hellip; Fir milenge chalte chalte.
      </p>

    </div>
  </PageShell>
)

export default FarewellFynd