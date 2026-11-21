"use client"

import { useEffect, useMemo, useState } from "react"
import { asciiBar, scrollFrame, wrapText } from "./scroll"

const RAMP = " .,:;-~=+*ox#%@"
const WIDTH = 46
/** ms per settled character; a 80-char line takes ~3 s */
const CHAR_MS = 36
/** linger after the text is complete and the scene is ready */
const HOLD_MS = 700
const FADE_MS = 700

/**
 * "Ancient lore" loader: an ASCII scroll in which the lore typesets itself glyph by glyph,
 * with an ASCII progress bar. It always finishes saying its line before fading, even if the scene is ready sooner.
 */
export default function LoadingScreen({ text, progress, ready, sound, onGone }: {
  text: string
  progress: number
  ready: boolean
  sound: "on" | "blocked" | null
  onGone?: () => void
}) {
  const lines = useMemo(() => wrapText(text, WIDTH - 4), [text])
  const total = useMemo(() => lines.reduce((n, l) => n + l.length, 0), [lines])
  // only mounted on the client (after the desktop gate), so window is available
  const [reduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  const [typedRaw, setTyped] = useState(0)
  const typed = reduced ? total : typedRaw
  const [tick, setTick] = useState(0)
  const [phase, setPhase] = useState<"typing" | "fading" | "gone">("typing")

  useEffect(() => {
    if (reduced) return
    // one character per step (not wall-clock), so a busy main thread pauses the line instead of skipping it
    let n = 0
    const id = window.setInterval(() => {
      n = Math.min(total, n + 1)
      setTyped(n); setTick((t) => t + 1)
      if (n >= total) window.clearInterval(id)
    }, CHAR_MS)
    return () => window.clearInterval(id)
  }, [total, reduced])

  const finished = typed >= total
  useEffect(() => {
    if (!ready || !finished) return
    const a = window.setTimeout(() => setPhase("fading"), HOLD_MS)
    const b = window.setTimeout(() => { setPhase("gone"); onGone?.() }, HOLD_MS + FADE_MS)
    return () => { window.clearTimeout(a); window.clearTimeout(b) }
  }, [ready, finished, onGone])

  if (phase === "gone") return null

  // reveal `typed` characters across the wrapped lines; the next glyph cycles through the ramp
  const starts = lines.map((_, i) => lines.slice(0, i).reduce((n, l) => n + l.length, 0))
  const body = lines.map((l, i) => {
    const left = typed - starts[i]
    const shown = l.slice(0, Math.max(0, left))
    const next = left >= 0 && left < l.length && l[left] !== " " ? RAMP[(tick * 5 + left) % RAMP.length] : ""
    return shown + next
  })
  const pct = Math.round((ready ? 1 : progress) * 100)
  const frame = scrollFrame([
    "",
    center("·  t h e   l o r e  ·", WIDTH - 4),
    "",
    ...body,
    "",
    center(`${asciiBar(ready ? 1 : progress, 26)} ${String(pct).padStart(3)}%`, WIDTH - 4),
    sound === "blocked" ? center("( click anywhere to hear the forest )", WIDTH - 4) : "",
  ], WIDTH - 4)

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#fbfaf6] px-4 transition-opacity"
      style={{ opacity: phase === "fading" ? 0 : 1, transitionDuration: `${FADE_MS}ms` }}
      role="status"
      aria-live="polite"
      aria-label={`Loading the lore: ${text}`}
    >
      <pre aria-hidden className="select-none font-mono text-[13px] leading-[1.35] text-[#2b2722] sm:text-[15px] lg:text-[16px]">{frame.join("\n")}</pre>
    </div>
  )
}

function center(s: string, w: number) {
  const left = Math.max(0, Math.floor((w - s.length) / 2))
  return " ".repeat(left) + s
}
