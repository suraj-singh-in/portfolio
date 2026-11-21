import Link from "next/link"
import { Caveat } from "next/font/google"
import { pageMetadata } from "@/lib/metadata"
import LibraryScene from "./components/LibraryScene"
import ShelfList from "./components/ShelfList"

const caveat = Caveat({ variable: "--font-hand", subsets: ["latin"] })

export const metadata = pageMetadata({
  title: "Library",
  description:
    "A pencil-sketched drawing of the bookshelves at home. Zoom into a shelf and open any book to see its cover, my review and a samosa rating.",
  path: "/library",
})

// Matches the site theme: white / neutral-900 in light mode, #111010 / neutral-100 in dark mode.
const THEME = `
.lib-root{--lib-ink:#171717;--lib-paper:#ffffff;--lib-sheet:#fafafa;--lib-veil:rgba(255,255,255,.9);--lib-tape:rgba(23,23,23,.1);color:var(--lib-ink)}
@media (prefers-color-scheme: dark){.lib-root{--lib-ink:#ededed;--lib-paper:#111010;--lib-sheet:#191818;--lib-veil:rgba(17,16,16,.9);--lib-tape:rgba(237,237,237,.14)}}
`

export default function LibraryPage() {
  return (
    <div className={`${caveat.variable} lib-root`}>
      <style>{THEME}</style>
      <LibraryScene />
      <Link
        href="/"
        className="fixed right-4 top-4 z-20 text-2xl underline-offset-4 hover:underline md:right-8 md:top-6"
        style={{ fontFamily: "var(--font-hand), cursive" }}
      >
        back to site →
      </Link>
      <ShelfList />
    </div>
  )
}
