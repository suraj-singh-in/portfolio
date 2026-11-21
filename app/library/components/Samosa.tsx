import type { Rating as RatingValue } from "../data/books"

const INK = "currentColor"
const SAMOSA_PATH =
  "M20 4 Q23 4 25 8 L36 31 Q38.5 36.5 33 36.5 L7 36.5 Q1.5 36.5 4 31 L15 8 Q17 4 20 4 Z"

/** One samosa. Not given = pencil outline; given = yellow fill with orange spots (as in the site icon). */
export function Samosa({ filled, size = 40 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ overflow: "visible" }}>
      <g filter="url(#pencil-wobble)">
        {filled && (
          <>
            <path d={SAMOSA_PATH} fill="#f6c945" />
            <circle cx="14" cy="31" r="2.6" fill="#e8892b" />
            <circle cx="28" cy="30" r="2.2" fill="#e8892b" />
            <circle cx="24" cy="14" r="2.2" fill="#e8892b" />
            <circle cx="17" cy="24" r="1.3" fill={INK} />
            <circle cx="24" cy="24" r="1.3" fill={INK} />
            <path d="M17.5 28 Q20.5 31 23.5 28" fill="none" stroke={INK} strokeWidth="1.1" strokeLinecap="round" />
          </>
        )}
        <path
          d={SAMOSA_PATH}
          fill="none"
          stroke={INK}
          strokeWidth={filled ? 1.5 : 1.3}
          strokeLinejoin="round"
          strokeDasharray={filled ? undefined : "0"}
          opacity={filled ? 1 : 0.7}
        />
        {!filled && (
          <path d="M16 10 L9 29 M20 8 L12 33 M24 11 L17 34" stroke={INK} strokeWidth="0.6" opacity="0.25" fill="none" />
        )}
      </g>
    </svg>
  )
}

export default function Rating({ value }: { value?: RatingValue }) {
  if (value === undefined) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-50">Unrated</p>
    )
  }
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${value} of 5 samosas`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Samosa key={i} filled={i < value} />
      ))}
    </div>
  )
}
