import Link from "next/link"

/** Shown instead of the scene on phones, tablets and narrow windows, and when WebGL is unavailable. */
export default function DesktopOnly({ reason }: { reason: "small" | "webgl" | "error"; detail?: string }) {
  const line = reason === "small"
    ? "Open this on a computer to walk around."
    : reason === "webgl"
      ? "This page needs WebGL. Try a recent desktop browser."
      : "Something went wrong while drawing the scene. Reload the page to try again."
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-white dark:bg-[#111010]">
      <main className="mx-auto max-w-2xl px-6 py-12 md:px-0 md:py-20">
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">← back</Link>
        <h1 className="mt-8 text-2xl font-semibold tracking-tighter text-neutral-900 dark:text-neutral-100">Lore</h1>
        <p className="mt-4 leading-relaxed text-neutral-700 dark:text-neutral-300">
          A small walkable world drawn entirely in text symbols: a hut at the edge of a forest, a fire, a horse grazing in a windy meadow.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/lore/still.webp" alt="The clearing: a thatched hut, a campfire, a red-shirted traveller and a horse, drawn in symbols on paper" className="mt-8 w-full rounded-lg border border-neutral-100 dark:border-neutral-800" />
        <p className="mt-6 text-sm text-neutral-500">{line}</p>
      </main>
    </div>
  )
}
