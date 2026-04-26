import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import PageShell from "@/components/PageShell"

export const metadata: Metadata = {
  title: "Sarmad Kashani — The Man Who Refused to Finish a Prayer",
  description: "A Jewish merchant from Persia who gave away everything, wandered naked through Mughal Delhi, and was beheaded for refusing to complete a sentence. The story of Sarmad Kashani.",
  alternates: { canonical: "/blogs/india-and-its-poets/sarmad-kashani-the-man-who-refused-to-finish-a-prayer" },
  authors: [{ name: "Suraj Singh" }],
  keywords: [
    "Sarmad Kashani", "Mughal India", "Sufi poetry", "Dara Shikoh", "Aurangzeb",
    "Indian history", "Persian poetry", "India and its Poets"
  ],
  openGraph: {
    title: "Sarmad Kashani — The Man Who Refused to Finish a Prayer",
    description: "A Jewish merchant from Persia who gave away everything, wandered naked through Mughal Delhi, and was beheaded for refusing to complete a sentence. The story of Sarmad Kashani.",
    url: "/blogs/india-and-its-poets/sarmad-kashani-the-man-who-refused-to-finish-a-prayer",
    type: "article",
    siteName: "Suraj Singh",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Sarmad Kashani — Suraj Singh" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sarmad Kashani — The Man Who Refused to Finish a Prayer",
    description: "A Jewish merchant from Persia who gave away everything, wandered naked through Mughal Delhi, and was beheaded for refusing to complete a sentence.",
    creator: "@__SurajSingh__",
    images: ["/opengraph-image"],
  },
}

const SarmadKashani = () => (
  <PageShell>

    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Sarmad Kashani — The Man Who Refused to Finish a Prayer",
          description: "A Jewish merchant from Persia who gave away everything, wandered naked through Mughal Delhi, and was beheaded for refusing to complete a sentence.",
          url: "https://notasecondhandlife.com/blogs/india-and-its-poets/sarmad-kashani-the-man-who-refused-to-finish-a-prayer",
          datePublished: "2026-04-19",
          dateModified: "2026-04-19",
          author: {
            "@type": "Person",
            name: "Suraj Singh",
            url: "https://notasecondhandlife.com",
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://notasecondhandlife.com/blogs/india-and-its-poets/sarmad-kashani-the-man-who-refused-to-finish-a-prayer",
          },
        }),
      }}
    />

    {/* Series label */}
    <Link
      href="/blogs/india-and-its-poets"
      className="text-xs font-medium tracking-widest uppercase text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors mb-4 inline-block"
    >
      India and its Poets · Episode 001
    </Link>

    <h1 className="font-semibold text-2xl mb-2 tracking-tighter text-neutral-900 dark:text-neutral-100">
      Sarmad Kashani — The Man Who Refused to Finish a Prayer
    </h1>
    <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-10">April 2026 · 5 min read</p>

    <div className="flex flex-col gap-5 text-neutral-700 dark:text-neutral-300 leading-relaxed">

      <p>Sarmad Kashani. You&apos;ve probably never heard this name.</p>

      <p>
        He was born Jewish in Persia sometime around 1590. Educated. Merchant family. Came to India
        in the 1600s chasing trade.
      </p>

      <p>He never went back.</p>

      <p>
        Somewhere between arriving in Sindh and wandering into Delhi, something shifted. He fell into
        Sufi philosophy so deeply that he gave away everything he owned. Stopped wearing clothes. Let
        his hair grow. Stopped cutting his nails. Just wandered, city to city, writing poetry in Persian.
      </p>

      <p>
        A French physician named François Bernier who was travelling through the Mughal empire at the
        time actually saw him and wrote about this naked faqir wandering the streets of Delhi like
        it was the most natural thing in the world.
      </p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">
        Neither Jew, nor Muslim, nor Hindu
      </h2>

      <p>
        Sarmad was born Jewish. At some point he nominally converted to Islam. But he himself used to
        warn Jews not to convert. And in his own poetry he wrote:
      </p>

      <blockquote className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 italic text-neutral-600 dark:text-neutral-400 space-y-2">
        <p>
          <span className="not-italic font-medium text-neutral-500 dark:text-neutral-500 text-sm">Persian —</span>
          <br />
          <em>Hast dar baatin-e man — Kaaba, o but-khaana, o dair.</em>
        </p>
        <p>Inside me lives the mosque, the temple, the synagogue. I am the Jew, the Muslim, the Brahmin.</p>
      </blockquote>

      <p>
        Scholars have called him the{" "}
        <em>&ldquo;Jewish-Yogi-Sufi Courtier of the Mughals&rdquo;</em> — which is possibly the most
        accurate description of any human being ever written.
      </p>

      <p>
        He became close to Dara Shikoh, the Mughal crown prince known for his interest in Sufi
        philosophy and Hindu-Muslim synthesis. Dara became his disciple. Which meant that when
        Aurangzeb killed Dara and took the throne, Sarmad had already made a powerful enemy.
      </p>

      <figure className="my-2">
        <Image
          src="/people/sarmad-kashani.jpg"
          alt="Shah Sarmad and Prince Dara Shikoh — Mughal miniature painting, ca. 1650"
          width={800}
          height={1000}
          className="w-full rounded-md object-cover"
        />
        <figcaption className="mt-2 text-xs text-neutral-400 dark:text-neutral-500 text-center leading-relaxed">
          Shah Sarmad seated with Prince Dara Shikoh. Mughal miniature, ca. 1650–1658.
          The Walters Art Museum, Baltimore (W.912). Public domain.
        </figcaption>
      </figure>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">The Half Prayer</h2>

      <p>
        The Islamic declaration of faith, the Kalima, goes:{" "}
        <em>La ilaha illallah.</em> There is no God, but Allah.
      </p>

      <p>Sarmad would only ever say the first half. <em>La ilaha.</em> There is no God. And stop.</p>

      <p>
        Aurangzeb had him arrested. His clerics asked Sarmad why he refused to complete it.
      </p>

      <p>
        He said —{" "}
        <em>I am still absorbed with the negative part. Why should I tell a lie?</em>
      </p>

      <p>
        That answer sealed his death sentence. They beheaded him in 1661, right outside the Jama
        Masjid in Delhi. A court chronicler named Ali Khan-Razi was present at the execution and
        recorded that Sarmad recited poetry as he walked to his death.
      </p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">The Tomb</h2>

      <p>
        His dargah (his shrine) is still there. Lal Kuan, Matia Mahal, Old Delhi. Right next to
        the Jama Masjid.
      </p>

      <p>The man who refused to belong to any religion. Buried in the shadow of one.</p>

      <p>People from every faith still come to visit.</p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">A Note on Responsibility</h2>

      <p>
        Everything in this piece comes from documented historical sources. The one claim worth
        flagging — <em>&ldquo;possibly the first Jew Aurangzeb killed&rdquo;</em> — is an inference,
        not a documented fact. What is documented is that he was executed by Aurangzeb&apos;s order in
        1661, on charges of atheism and unorthodox religious practice.
      </p>

      <p>
        The execution quote, <em>&ldquo;Why should I tell a lie?&rdquo;</em>, is confirmed by
        multiple primary sources including Aurangzeb&apos;s own court chronicler.
      </p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">References</h2>

      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Primary Sources</p>
      <ul className="list-disc pl-5 space-y-2 text-sm">
        <li>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Bernier, François</span>{" "}
          (1916). <em>Travels in the Mogul Empire AD 1656–1668.</em> Oxford University Press. —
          French physician who personally witnessed Sarmad; documents his wandering life.
        </li>
        <li>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Ali Khan-Razi</span> —
          Court chronicler of Aurangzeb. Present at the execution. Recorded Sarmad&apos;s final verses.
        </li>
        <li>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">The Rubaiyat of Sarmad</span>.
          Translated by Syeda Sayidain Hameed (1991). Indian Council for Cultural Relations.{" "}
          <a
            href="http://www.apnaorg.com/books/english/rubayat-sarmad/rubayat-sarmad.pdf"
            target="_blank"
            rel="noreferrer"
            className="underline text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            Full PDF
          </a>
        </li>
        <li>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Singer, I. &amp; Gray, L.H.</span>{" "}
          <em>Sarmad, Mohammed Sa&apos;id.</em> The Jewish Encyclopedia.{" "}
          <a
            href="https://www.jewishencyclopedia.com/articles/13206-sarmad-mohammed-sa-id"
            target="_blank"
            rel="noreferrer"
            className="underline text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            jewishencyclopedia.com
          </a>
        </li>
      </ul>

      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-2">Image</p>
      <ul className="list-disc pl-5 space-y-2 text-sm">
        <li>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            Single Leaf of Shah Sarmad and Prince Dara Shikoh
          </span>{" "}
          — Unknown Indian artist, ca. 1650–1658. The Walters Art Museum, Baltimore (Accession W.912).
          Public domain.{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Indian_-_Single_Leaf_of_Shah_Sarmad_and_Prince_Dara_Shikoh_-_Walters_W912.jpg"
            target="_blank"
            rel="noreferrer"
            className="underline text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            Wikimedia Commons
          </a>
        </li>
      </ul>

      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-2">Location</p>
      <p className="text-sm">
        <span className="font-medium text-neutral-800 dark:text-neutral-200">Sarmad Shaheed Dargah</span> —
        Lal Kuan, Matia Mahal, Old Delhi (next to Jama Masjid).
      </p>

      <hr className="border-neutral-100 dark:border-neutral-800" />
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Part of the series —{" "}
        <Link href="/blogs/india-and-its-poets" className="underline hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
          <em>India and its Poets</em>
        </Link>
      </p>

    </div>
  </PageShell>
)

export default SarmadKashani
