import type { Metadata } from "next"
import PageShell from "@/components/PageShell"

export const metadata: Metadata = {
  title: "The Jews of Kerala — 1,500 Years of a Story Nobody Tells",
  description: "In 70 AD, Jews fleeing the destruction of the Second Temple found safety on the coast of Kerala. They stayed for 1,500 years — until the Portuguese arrived.",
  alternates: { canonical: "/blogs/indian-history/the-jews-of-kerala-1500-years-of-a-story-nobody-tells" },
  authors: [{ name: "Suraj Singh" }],
  keywords: [
    "Jews of Kerala", "Cochin Jews", "Paradesi Synagogue", "Indian history",
    "Kerala history", "Portuguese India", "Vasco da Gama", "Joseph Rabban",
    "Malabar", "Kochi"
  ],
  openGraph: {
    title: "The Jews of Kerala — 1,500 Years of a Story Nobody Tells",
    description: "In 70 AD, Jews fleeing the destruction of the Second Temple found safety on the coast of Kerala. They stayed for 1,500 years — until the Portuguese arrived.",
    url: "/blogs/indian-history/the-jews-of-kerala-1500-years-of-a-story-nobody-tells",
    type: "article",
    siteName: "Suraj Singh",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "The Jews of Kerala — Suraj Singh" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Jews of Kerala — 1,500 Years of a Story Nobody Tells",
    description: "In 70 AD, Jews fleeing the destruction of the Second Temple found safety on the coast of Kerala. They stayed for 1,500 years — until the Portuguese arrived.",
    creator: "@__SurajSingh__",
    images: ["/opengraph-image"],
  },
}

const JewsOfKerala = () => (
  <PageShell>

    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "The Jews of Kerala — 1,500 Years of a Story Nobody Tells",
          description: "In 70 AD, Jews fleeing the destruction of the Second Temple found safety on the coast of Kerala. They stayed for 1,500 years — until the Portuguese arrived.",
          url: "https://notasecondhandlife.com/blogs/indian-history/the-jews-of-kerala-1500-years-of-a-story-nobody-tells",
          datePublished: "2026-04-26",
          dateModified: "2026-04-26",
          author: {
            "@type": "Person",
            name: "Suraj Singh",
            url: "https://notasecondhandlife.com",
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://notasecondhandlife.com/blogs/indian-history/the-jews-of-kerala-1500-years-of-a-story-nobody-tells",
          },
        }),
      }}
    />

    {/* Series label */}
    <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-4">
      India and its History · Episode 001
    </p>

    <h1 className="font-semibold text-2xl mb-2 tracking-tighter text-neutral-900 dark:text-neutral-100">
      The Jews of Kerala — 1,500 Years of a Story Nobody Tells
    </h1>
    <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-10">April 2026 · 5 min read</p>

    <div className="flex flex-col gap-5 text-neutral-700 dark:text-neutral-300 leading-relaxed">

      <p>In 70 AD, the Romans destroyed the Second Temple in Jerusalem.</p>

      <p>Jews fled. Some went west. Some went east. A small community, by some accounts, got on ships and sailed until they hit the coast of Kerala.</p>

      <p>They would stay for 1,500 years.</p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">The Arrival</h2>

      <p>
        The exact year is disputed — some accounts say 70 AD, some as early as 562 BC after the
        destruction of the First Temple, some as late as the 4th century. What is consistent across
        almost every account is the reason: persecution.
      </p>

      <p>And what is equally consistent is what they found in Kerala: safety.</p>

      <p>
        The local rulers — the Chera kings, and later various regional princes — received them. Gave
        them land. Gave them rights. A copper plate grant attributed to the Chera king Bhaskara Ravi
        Varma — dated to around 1000 AD — records land and privileges given to a Jewish merchant
        named Joseph Rabban and his community. The grant was hereditary. It gave them the right to
        use a palanquin, to be received with musical instruments, to carry a lamp in procession.
      </p>

      <p>These were the rights of the elite.</p>

      <p>For a community that had been fleeing for centuries, this was extraordinary.</p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">What 1,500 Years Looks Like</h2>

      <p>
        They built synagogues. They traded. They married — carefully, within their community. They
        spoke Malayalam and Judeo-Malayalam. They held the Torah and the rhythms of Jewish religious
        life while living inside a Hindu society that, for the most part, left them alone.
      </p>

      <p>
        Kerala in this period was — and this is not a romanticized reading — genuinely pluralistic
        in a practical sense. Christianity had arrived in AD 52, when St Thomas the Apostle is
        believed to have landed at Cranganore. Islam came through Arab traders. Judaism was already
        here. The faiths existed alongside each other because trade required it. The Zamorins of
        Calicut, the dominant rulers of medieval Kerala, derived their wealth from international
        commerce. Persecution was bad for business.
      </p>

      <p>
        So the Jews of Kerala were not merely tolerated. They were embedded. They were merchants,
        part of the trade networks that made Malabar one of the most commercially active coastlines
        in the medieval world.
      </p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">Then the Portuguese Arrived</h2>

      <p>In 1498, Vasco da Gama landed at Calicut.</p>

      <p>
        He came looking for Christians and spices. He found both. He also found a prosperous,
        cosmopolitan trading world that he proceeded to dismember with extraordinary violence.
      </p>

      <p>
        Da Gama&apos;s methods in Kerala were not subtle. He burned ships carrying pilgrims. He sank
        vessels full of civilians. He tortured and mutilated envoys. He demanded monopolies and used
        force to get them. The Portuguese arrived with the logic that trade was war by other means —
        and they were willing to drop the disguise.
      </p>

      <p>The Jews of Kerala were caught in this.</p>

      <p>
        The Portuguese brought the Inquisition&apos;s shadow with them. They had expelled Jews from
        Portugal in 1497 — one year before da Gama set sail for India. The community that had found
        1,500 years of safety in Kerala was now facing the same European hostility that had driven
        their ancestors east in the first place.
      </p>

      <p>
        There is something almost cruel in the symmetry of it. Fled Jerusalem in 70 AD. Found safety
        in Kerala. Lasted fifteen centuries. Harassed again by the same civilization, just a
        different country.
      </p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">What Remains</h2>

      <p>
        The Paradesi Synagogue in Mattancherry, Kochi — built in 1568 — is one of the oldest
        functioning synagogues in the Commonwealth. The hand-painted Chinese tiles on the floor.
        The Belgian crystal chandeliers. The copper plates recording Joseph Rabban&apos;s land grant
        are preserved there.
      </p>

      <p>Almost nobody is left.</p>

      <p>
        The Cochin Jewish community — at its peak a few thousand people — largely emigrated to
        Israel after 1948. The community that had survived the Romans, the Portuguese, the British,
        and two millennia of history was essentially emptied by the possibility of return.
      </p>

      <p>As of the last estimates, fewer than fifty Jews remain in Kerala.</p>

      <p>The synagogue still stands. The copper plates still exist. The story is almost entirely gone.</p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">A Note on Responsibility</h2>

      <p>
        The copper plate grant to Joseph Rabban is a documented artifact, held at the Paradesi
        Synagogue in Kochi and widely studied by historians. Its exact dating is debated — estimates
        range from the 4th century to the 11th century AD.
      </p>

      <p>
        The date of the Jewish community&apos;s arrival (70 AD) is the most commonly cited tradition
        within the community itself. Some historians place it earlier or later. What is not disputed
        is the long duration of their presence and the documented royal protection they received.
      </p>

      <p>
        The account of Portuguese violence is based on primary sources —
        Gaspar Correia&apos;s <em>Lendas da India</em> and other Portuguese chronicles document da
        Gama&apos;s actions in detail, including from the perspective of the perpetrators.
      </p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">References</h2>

      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Books</p>
      <ul className="list-disc pl-5 space-y-2 text-sm">
        <li>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Manu S. Pillai</span>{" "}
          — <em>The Ivory Throne: Chronicles of the House of Travancore</em> (2015). HarperCollins
          India. — Source for Kerala&apos;s pluralistic trade context and the Portuguese disruption.
        </li>
        <li>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Barbara Johnson</span>{" "}
          — <em>&ldquo;Our Community&rdquo; in Two Worlds: The Cochin Paradesi Jews in India and Israel</em>{" "}
          (1985). University of Massachusetts. — Academic study of the Cochin Jewish community.
        </li>
        <li>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Gaspar Correia</span>{" "}
          — <em>Lendas da India</em> (c. 1550s). — Portuguese chronicle documenting da Gama&apos;s
          actions; written by a contemporary who was in India.
        </li>
      </ul>

      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-2">Location</p>
      <p className="text-sm">
        <span className="font-medium text-neutral-800 dark:text-neutral-200">Paradesi Synagogue</span>{" "}
        — Synagogue Lane, Mattancherry, Kochi, Kerala. The copper plates and physical synagogue are
        primary sources. Open to visitors.
      </p>

      <hr className="border-neutral-100 dark:border-neutral-800" />
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Part of the series — <em>India and its History</em>
      </p>

    </div>
  </PageShell>
)

export default JewsOfKerala
