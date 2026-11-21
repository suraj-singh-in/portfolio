import { hashString, hatch, mulberry32, sketchRect, wobbleLine } from "../lib/pencil"

const INK = "currentColor"

function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ""
  for (const w of words) {
    if ((line + " " + w).trim().length > max && line) {
      lines.push(line)
      line = w
    } else {
      line = (line + " " + w).trim()
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 6)
}

/** Fallback cover drawn in pencil from title + author, seeded so a book always gets the same cover. */
export default function PencilCover({ title, author }: { title: string; author?: string }) {
  const rand = mulberry32(hashString(title))
  const border = sketchRect(8, 8, 284, 424, rand, 1.6, 2)
  const inner = sketchRect(22, 22, 256, 396, rand, 1.2, 1)
  const band = hatch(22, 300, 256, 118, 8, rand)
  const sun = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2
    return wobbleLine(150 + Math.cos(a) * 30, 120 + Math.sin(a) * 30, 150 + Math.cos(a) * 52, 120 + Math.sin(a) * 52, rand, 1.2, 0)
  }).join(" ")
  const lines = wrap(title, 16)
  const size = lines.length > 3 ? 26 : 32
  return (
    <svg viewBox="0 0 300 440" role="img" aria-label={`Pencil-drawn cover of ${title}`} className="block h-auto w-full">
      <rect width="300" height="440" style={{ fill: "var(--lib-sheet)" }} />
      <g filter="url(#pencil-wobble)" fill="none" stroke={INK} strokeLinecap="round">
        <path d={band} strokeWidth="0.8" opacity="0.28" />
        <path d={sun} strokeWidth="1.2" opacity="0.6" />
        <path d={inner} strokeWidth="1.1" opacity="0.6" />
        <path d={border} strokeWidth="2" />
      </g>
      <g fill={INK} textAnchor="middle" style={{ fontFamily: "var(--font-hand), 'Segoe Print', cursive" }}>
        {lines.map((l, i) => (
          <text key={i} x="150" y={215 + i * (size + 4)} fontSize={size}>
            {l}
          </text>
        ))}
        {author && (
          <text x="150" y="395" fontSize="20" opacity="0.8">
            {author}
          </text>
        )}
      </g>
    </svg>
  )
}
