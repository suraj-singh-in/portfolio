import type { Metadata } from "next"
import PageShell from "@/components/PageShell"

export const metadata: Metadata = {
  title: "About — Not a Second Hand Life",
  description: "On Krishnamurti's idea of the second-hand person, and a pledge to not live a borrowed life.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Not a Second Hand Life",
    description: "On Krishnamurti's idea of the second-hand person, and a pledge to not live a borrowed life.",
    url: "/about",
    type: "website",
  },
}

const About = () => (
  <PageShell>
    <h1 className="font-semibold text-2xl mb-10 tracking-tighter text-neutral-900 dark:text-neutral-100">
      Not a Second Hand Life
    </h1>

    <div className="flex flex-col gap-5 text-neutral-700 dark:text-neutral-300 leading-relaxed">

      <p>
        Jiddu Krishnamurti had a phrase for it. He called us{" "}
        <em>second-hand people</em>.
      </p>

      <blockquote className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 italic text-neutral-600 dark:text-neutral-400">
        For centuries we have been spoon-fed by our teachers, by our authorities, by our books,
        our saints. We say, &ldquo;Tell me all about it.&rdquo; And we are satisfied with their
        descriptions, which means that we live on words and our life is shallow and empty. We are
        second-hand people. We have lived on what we have been told — guided by our inclinations,
        our tendencies, or compelled to accept by circumstances and environment. We are the result
        of all kinds of influences and there is nothing new in us, nothing that we have discovered
        for ourselves; nothing original, pristine, clear.
      </blockquote>

      <p>
        He meant: most of us inherit our opinions. We receive our beliefs the way we receive
        furniture from whoever lived in the house before us. Our convictions about what matters,
        what is true, what a good life looks like, almost none of it was arrived at. It was
        absorbed. Installed. And then defended as if it were our own.
      </p>

      <p>
        The tragedy isn&apos;t that we were influenced. Influence is unavoidable. The tragedy is
        that we stopped there. We took the map for the territory. We took the description of the
        mountain for the climb.
      </p>

      <p>
        A second-hand life is one lived on borrowed conclusions, borrowed gods, borrowed politics,
        borrowed definitions of success, borrowed ideas of who you are supposed to be. It is
        comfortable. It requires almost nothing. And it leaves you, at the end, with the strange
        feeling that you were never quite present for your own existence.
      </p>

      <hr className="border-neutral-100 dark:border-neutral-800" />

      <p>
        This site is a pledge against that.
      </p>

      <p>
        Not a grand one. Not a perfect one. Just a daily, failing, trying-again commitment to
        encounter things directly, to read and think and write from my own confrontation with
        ideas, not from what I have been told to think about them. To be curious about
        history, because it is genuinely astonishing, not because it is fashionable. To write code
        that solves real problems, not to perform productivity. To ask the uncomfortable question
        even when the comfortable answer is available.
      </p>

      <p>
        The name is a reminder. Addressed to myself, mostly.
      </p>

      <p>
        — Suraj Singh
      </p>

    </div>
  </PageShell>
)

export default About
