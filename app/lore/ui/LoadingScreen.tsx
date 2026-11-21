"use client"

import { useEffect, useState } from "react"

const RAMP = " .,:;-~=+*ox#%@"
const SETTLE_MS = 120

/** "Ancient lore" loader: a line of lore typesets glyph by glyph above an ink rule that fills with progress. */
export default function LoadingScreen({ text, progress, done }: { text: string; progress: number; done: boolean }) {
  const [shown, setShown] = useState("")
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) { setShown(text); return }
    let i = 0, tick = 0
    const id = window.setInterval(() => {
      tick++
      const settled = text.slice(0, i)
      if (i >= text.length) { setShown(text); window.clearInterval(id); return }
      const cycling = RAMP[(tick * 3) % RAMP.length]
      setShown(settled + (text[i] === " " ? " " : cycling))
      if (tick % Math.max(1, Math.round(SETTLE_MS / 30)) === 0) i++
    }, 30)
    return () => window.clearInterval(id)
  }, [text])

  useEffect(() => {
    if (!done) return
    const id = window.setTimeout(() => setGone(true), 700)
    return () => window.clearTimeout(id)
  }, [done])

  if (gone) return null
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#fbfaf6] px-6 transition-opacity duration-700"
      style={{ opacity: done ? 0 : 1 }}
      role="status"
      aria-live="polite"
      aria-label="Loading the lore"
    >
      <div className="w-full max-w-xl">
        <p className="min-h-[3em] font-mono text-sm leading-relaxed tracking-wide text-neutral-700">{shown}</p>
        <div className="mt-4 h-px w-full bg-neutral-200">
          <div className="h-px bg-neutral-800 transition-[width] duration-300" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      </div>
    </div>
  )
}
