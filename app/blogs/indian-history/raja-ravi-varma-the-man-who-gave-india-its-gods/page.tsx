import type { Metadata } from "next"
import Link from "next/link"
import PageShell from "@/components/PageShell"

export const metadata: Metadata = {
  title: "Raja Ravi Varma — The Man Who Gave India Its Gods",
  description: "A painter from Kerala who combined European oil technique with Hindu mythology and accidentally defined how an entire civilization visualizes its own gods. He died in 1906. His images never did.",
  alternates: { canonical: "/blogs/indian-history/raja-ravi-varma-the-man-who-gave-india-its-gods" },
  authors: [{ name: "Suraj Singh" }],
  keywords: [
    "Raja Ravi Varma", "Indian art", "Kerala history", "Hindu mythology",
    "Dadasaheb Phalke", "Indian cinema", "Travancore", "Indian history",
    "calendar art", "lithographic press"
  ],
  openGraph: {
    title: "Raja Ravi Varma — The Man Who Gave India Its Gods",
    description: "A painter from Kerala who combined European oil technique with Hindu mythology and accidentally defined how an entire civilization visualizes its own gods.",
    url: "/blogs/indian-history/raja-ravi-varma-the-man-who-gave-india-its-gods",
    type: "article",
    siteName: "Suraj Singh",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Raja Ravi Varma — Suraj Singh" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raja Ravi Varma — The Man Who Gave India Its Gods",
    description: "A painter from Kerala who combined European oil technique with Hindu mythology and accidentally defined how an entire civilization visualizes its own gods.",
    creator: "@__SurajSingh__",
    images: ["/opengraph-image"],
  },
}

const RajaRaviVarma = () => (
  <PageShell>

    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Raja Ravi Varma — The Man Who Gave India Its Gods",
          description: "A painter from Kerala who combined European oil technique with Hindu mythology and accidentally defined how an entire civilization visualizes its own gods.",
          url: "https://notasecondhandlife.com/blogs/indian-history/raja-ravi-varma-the-man-who-gave-india-its-gods",
          datePublished: "2026-04-26",
          dateModified: "2026-04-26",
          author: {
            "@type": "Person",
            name: "Suraj Singh",
            url: "https://notasecondhandlife.com",
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://notasecondhandlife.com/blogs/indian-history/raja-ravi-varma-the-man-who-gave-india-its-gods",
          },
        }),
      }}
    />

    {/* Series label */}
    <Link
      href="/blogs/indian-history"
      className="text-xs font-medium tracking-widest uppercase text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors mb-4 inline-block"
    >
      India and its History · Episode 002
    </Link>

    <h1 className="font-semibold text-2xl mb-2 tracking-tighter text-neutral-900 dark:text-neutral-100">
      Raja Ravi Varma — The Man Who Gave India Its Gods
    </h1>
    <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-10">April 2026 · 6 min read</p>

    <div className="flex flex-col gap-5 text-neutral-700 dark:text-neutral-300 leading-relaxed">

      <p>Raja Ravi Varma. You&apos;ve probably seen his work without knowing his name.</p>

      <p>
        That image of Goddess Lakshmi standing on a lotus, draped in red and gold, holding a pot
        of coins — the one you&apos;ve seen on calendars, on temple walls, on the packaging of half
        the products in your grandmother&apos;s kitchen. That&apos;s him.
      </p>

      <p>He painted it in 1896.</p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">The Painter from Kilimanoor</h2>

      <p>
        He was born on 29 April 1848 in Kilimanoor — a small royal estate in Travancore, in what is
        now Kerala. His family was aristocratic, connected to the Travancore royal house. As a child
        he was presented at the court of the Maharaja of Travancore, Ayilyam Thirunal, who
        recognized something unusual in the boy and arranged for his formal training.
      </p>

      <p>
        He learned painting the traditional way first. Then he learned oil painting — a European
        technique — from a Dutch painter named Theodore Jensen who had come to the Travancore court.
      </p>

      <p>Nobody had done this before. Nobody had looked at Hindu mythology and rendered it in the language of European academic realism.</p>

      <p>That combination — the content of one civilization, the technique of another — is what made him.</p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">What He Actually Did</h2>

      <p>
        Before Ravi Varma, India&apos;s gods lived in stylized forms. Flat, two-dimensional, symbolic.
        Mughal miniatures. Temple bronzes. Folk paintings. Beautiful, but distant. Intentionally
        distant — divinity wasn&apos;t supposed to look like a person.
      </p>

      <p>Ravi Varma changed that.</p>

      <p>
        He painted Sita. He painted Draupadi. He painted Shakuntala. He painted Lakshmi and
        Saraswati and Parvati. He painted them as women — real women with weight and shadow and
        emotion in their faces. You could look at his Damayanti and feel she was thinking something.
      </p>

      <p>
        An entire generation of Indians saw these paintings and that is the version of their gods
        they carried forward. The image became the standard. So completely that most people today
        don&apos;t realize it was a choice someone made in the 1880s.
      </p>

      <p>That&apos;s the quiet enormity of what he did.</p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">The Presses</h2>

      <p>
        In 1894, he set up a lithographic press — the Ravi Varma Fine Arts Lithographic Press — in
        Ghatkopar, Bombay. For the first time, his paintings could be mass-reproduced as affordable
        prints.
      </p>

      <p>They sold everywhere. Every home that couldn&apos;t afford a painting could now have a print. The gods entered ordinary houses.</p>

      <p>He didn&apos;t just make art. He made the <em>distribution</em> of art.</p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">The Film Connection</h2>

      <p>Ravi Varma died on 2 October 1906.</p>

      <p>
        Two years later, a young man named Dhundiraj Govind Phalke — later known as Dadasaheb
        Phalke, the father of Indian cinema — saw a silent film on the life of Christ in Bombay and
        walked out thinking: why can&apos;t we do this for our own gods?
      </p>

      <p>
        The visual language he used to tell those stories, the way he imagined Krishna and Rama and
        Sita on screen — it came directly from Ravi Varma&apos;s paintings. His images were the reference.
      </p>

      <p>
        Dadasaheb Phalke&apos;s first film, <em>Raja Harishchandra</em> (1913), is considered the first
        Indian feature film. The mythology it depicted looked like Ravi Varma&apos;s paintings because
        that&apos;s the only visual vocabulary anyone had for it.
      </p>

      <p>Indian cinema was born with Ravi Varma&apos;s aesthetic already in its DNA.</p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">What Gets Lost in the Praise</h2>

      <p>He was extraordinary. He was also contested.</p>

      <p>
        Traditionalists attacked him for making the gods too human, too accessible — for stripping
        divinity of its appropriate distance. Some critics said he had commercialized the sacred.
        That the mass-printed calendar art cheapened what should have been rare.
      </p>

      <p>
        There&apos;s something worth sitting with in that critique. When one man&apos;s interpretation of a
        goddess becomes so dominant that it crowds out every other interpretation — that&apos;s a kind of
        power. Not malicious power, but power nonetheless.
      </p>

      <p>He gave India its gods. He also, in a way, narrowed them.</p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">A Note on Responsibility</h2>

      <p>
        The connection between Ravi Varma and the visual language of early Indian cinema is
        documented and not disputed. The specific detail about Dadasaheb Phalke drawing from Ravi
        Varma&apos;s aesthetic is widely referenced in film scholarship.
      </p>

      <p>
        The claim that his images are &ldquo;the standard&rdquo; most Indians carry is an observation, not a
        documented fact — but it is one shared by most Indian art historians.
      </p>

      <p>
        The Kilimanoor family&apos;s claimed Rajput descent is noted by Manu S. Pillai in{" "}
        <em>The Ivory Throne</em> with deliberate scepticism — Pillai uses the word{" "}
        <em>claiming</em> rather than stating it as fact.
      </p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">References</h2>

      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Books</p>
      <ul className="list-disc pl-5 space-y-2 text-sm">
        <li>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Manu S. Pillai</span>{" "}
          — <em>The Ivory Throne: Chronicles of the House of Travancore</em> (2015). HarperCollins
          India. — Primary source for biographical details and Kerala court context.
        </li>
        <li>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Rupika Chawla</span>{" "}
          — <em>Raja Ravi Varma: Painter of Colonial India</em> (2010). Mapin Publishing. — The
          most thorough biographical study.
        </li>
        <li>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Geeta Kapur</span>{" "}
          — <em>When Was Modernism: Essays on Contemporary Cultural Practice in India</em> (2000).
          — Critical framing of Ravi Varma&apos;s place in Indian modernity.
        </li>
      </ul>

      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-2">Paintings worth finding</p>
      <ul className="list-disc pl-5 space-y-3 text-sm">
        <li>
          <a
            href="https://artsandculture.google.com/asset/sita-bhumi-pravesh-raja-ravi-varma/jwEyTCqmNqpCsQ"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-neutral-800 dark:text-neutral-200 underline hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
          >
            Sita Bhumi Pravesh
          </a>{" "}
          <span className="text-neutral-500 dark:text-neutral-400">— The earth opens to receive Sita after Rama questions her fidelity. She does not resist. She asks Mother Earth to take her back. Painted in 1880, it was his first Ramayana work and the first to enter the royal collection at Baroda. The darkness in the colour palette is deliberate.</span>
        </li>
        <li>
          <a
            href="https://commons.wikimedia.org/wiki/File:Ravi_Varma-Ravana_Sita_Jathayu.jpg"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-neutral-800 dark:text-neutral-200 underline hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
          >
            Ravana Carrying Off Sita and Opposed by Jatayu
          </a>{" "}
          <span className="text-neutral-500 dark:text-neutral-400">— The old eagle Jatayu tries to stop Ravana mid-flight as he abducts Sita. Ravana slices off his wing. Sita covers her eyes. Three figures in violent motion against an open sky. Painted 1895 — probably his most kinetic composition.</span>
        </li>
        <li>
          <a
            href="https://commons.wikimedia.org/wiki/File:Yashoda_with_Krishna,_Raja_Ravi_Varma.jpg"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-neutral-800 dark:text-neutral-200 underline hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
          >
            Yashoda Pointing Balakrishna to His Cows
          </a>{" "}
          <span className="text-neutral-500 dark:text-neutral-400">— A quiet domestic scene: Yashoda gestures toward the herd as young Krishna looks up at her. No drama, no divinity on display. Just a mother and a boy. The tenderness in it is the point.</span>
        </li>
        <li>
          <a
            href="https://commons.wikimedia.org/wiki/File:Victory-of-indrajit.jpg"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-neutral-800 dark:text-neutral-200 underline hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
          >
            Victory of Indrajit
          </a>{" "}
          <span className="text-neutral-500 dark:text-neutral-400">— Meghnad, Ravana&apos;s son, stands triumphant after binding Rama and Lakshmana with his Brahmastra. One of the few Ravi Varma paintings where the &ldquo;villain&rdquo; is the subject — painted with the same dignity he reserved for heroes.</span>
        </li>
        <li>
          <a
            href="https://artsandculture.google.com/asset/adi-shankaracharya-raja-ravi-varma/WgFvX3x6i0ckfQ"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-neutral-800 dark:text-neutral-200 underline hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
          >
            Adi Shankaracharya
          </a>{" "}
          <span className="text-neutral-500 dark:text-neutral-400">— 1904. The philosopher seated on the banks of a river with his four disciples: Padmapadacharya, Thotakacharya, Hastamalakacharya, Sureshwaracharya. Painted two years before Ravi Varma&apos;s death — calm, scholarly, nothing like his mythological drama.</span>
        </li>
        <li>
          <a
            href="https://artsandculture.google.com/asset/krishna-s-embassy-to-duryodhana-raja-ravi-varma/0wEY_dgj9GXB2g"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-neutral-800 dark:text-neutral-200 underline hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
          >
            Krishna&apos;s Embassy to Duryodhana
          </a>{" "}
          <span className="text-neutral-500 dark:text-neutral-400">— 1905. Krishna arrives at the Kaurava court as a last attempt to prevent the Kurukshetra war. Duryodhana refuses. The painting captures the exact moment before the war becomes inevitable — everyone in the room knows what comes next.</span>
        </li>
        <li>
          <a
            href="https://artsandculture.google.com/asset/ram-sagar-darpa-haran-or-rama-vanquishing-the-ocean-ravi-varma-press/lgFBNwdKUb-oYA"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-neutral-800 dark:text-neutral-200 underline hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
          >
            Ram Sagar Darpa Haran — Rama Vanquishing the Ocean
          </a>{" "}
          <span className="text-neutral-500 dark:text-neutral-400">— Rama&apos;s monkey army cannot cross the sea to Lanka. He meditates for three days at the shore. The ocean refuses to yield. Rama reaches for his bow. The ocean god appears. This is the moment he picks — not the miracle, but the fury just before it.</span>
        </li>
      </ul>

      <hr className="border-neutral-100 dark:border-neutral-800" />
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Part of the series —{" "}
        <Link href="/blogs/indian-history" className="underline hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
          <em>India and its History</em>
        </Link>
      </p>

    </div>
  </PageShell>
)

export default RajaRaviVarma
