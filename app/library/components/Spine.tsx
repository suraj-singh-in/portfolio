import type { Book } from "../data/books"
import { hashString, hatch, mulberry32, sketchRect, wobbleLine } from "../lib/pencil"
import { INK, type Rect } from "./Cabinets"

export type PlacedSpine = { book: Book; x: number; w: number; h: number }

/** Deterministic width/height-fraction for a book, from its title. */
export function spineSize(book: Book): { w: number; hFrac: number } {
  const h = hashString(book.title)
  return { w: 18 + (h % 17), hFrac: 0.54 + ((h >>> 8) % 24) / 100 } // max 0.77: leaves clear headroom for the shelf label
}

/** Lay spines left→right on a shelf; if they do not fit, shrink all widths proportionally. */
export function packSpines(books: Book[], shelf: Rect): PlacedSpine[] {
  const gap = 3
  const pad = 10
  const sizes = books.map(spineSize)
  const avail = shelf.w - pad * 2
  const total = sizes.reduce((s, z) => s + z.w + gap, 0)
  const k = total > avail ? avail / total : 1
  let x = shelf.x + pad
  return books.map((book, i) => {
    const w = Math.max(7, sizes[i].w * k)
    const placed = { book, x, w, h: shelf.h * sizes[i].hFrac }
    x += w + gap * k
    return placed
  })
}

const truncate = (s: string, max: number) => (s.length > max ? s.slice(0, Math.max(1, max - 1)).trimEnd() + "…" : s)

type Props = {
  spine: PlacedSpine
  bottom: number
  interactive: boolean
  onOpen: (id: string) => void
}

export default function Spine({ spine, bottom, interactive, onOpen }: Props) {
  const { book, x, w, h } = spine
  const seed = hashString(book.title)
  const rand = mulberry32(seed)
  const top = bottom - h
  // Shrink the lettering to fit the spine before ever truncating.
  const room = h - 22
  const fontSize = Math.max(7, Math.min(14, w * 0.5, room / (book.title.length * 0.5)))
  const maxChars = Math.floor(room / (fontSize * 0.5))
  const gap = 4 + (seed % 4)
  const dark = seed % 3 === 0

  const outline = sketchRect(x, top, w, h, rand, 1.1, 2)
  const fill = hatch(x + 1, top + 1, w - 2, h - 2, dark ? gap : gap + 5, rand)
  const bands = [
    wobbleLine(x + 1, top + 9, x + w - 1, top + 9, rand, 0.7, 0),
    wobbleLine(x + 1, bottom - 9, x + w - 1, bottom - 9, rand, 0.7, 0),
  ].join(" ")

  return (
    <g
      className={interactive ? "spine spine-live" : "spine"}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : -1}
      aria-label={interactive ? book.title : undefined}
      aria-hidden={interactive ? undefined : true}
      onClick={interactive ? () => onOpen(book.id) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onOpen(book.id)
              }
            }
          : undefined
      }
    >
      <rect x={x} y={top} width={w} height={h} fill="#efe8d8" opacity={0.001} />
      <g fill="none" stroke={INK} strokeLinecap="round">
        <path d={fill} strokeWidth={0.7} opacity={dark ? 0.55 : 0.3} />
        <path d={bands} strokeWidth={0.9} opacity={0.7} />
        <path d={outline} strokeWidth={1.3} />
      </g>
      <text
        transform={`translate(${x + w / 2 + fontSize * 0.32} ${top + h / 2}) rotate(-90)`}
        textAnchor="middle"
        fontSize={fontSize}
        fill={INK}
        style={{ fontFamily: "var(--font-hand), 'Segoe Print', cursive", pointerEvents: "none" }}
      >
        {truncate(book.title, maxChars)}
      </text>
    </g>
  )
}
