"use client"

import Link from "next/link"
import type { RefObject } from "react"
import { asciiBox } from "./scroll"

export type HudState = {
  caption: string | null
  prompt: boolean
  muted: boolean | null
  stats: string | null
}

/** Same ink-on-paper voice as the scene: monospace ink glyphs, ASCII frames, a soft paper wash for legibility. */
const ink = "font-mono text-[12px] leading-[1.35] text-[#2b2722] whitespace-pre"
const paper = "bg-[#fbfaf6]/85 backdrop-blur-[1px]"

export default function Hud({ s, playerName, nameRef }: { s: HudState; playerName: string; nameRef: RefObject<HTMLDivElement | null> }) {
  const controls = asciiBox("controls", [
    ["W A S D", "walk"],
    ["shift", "run"],
    ["scroll", "zoom"],
    ["M", s.muted === null ? "sound" : s.muted ? "unmute" : "mute"],
  ], 8)

  return (
    <>
      <Link href="/" className={`${ink} ${paper} fixed left-4 top-4 z-[60] px-1 opacity-80 transition-opacity hover:opacity-100`} aria-label="Back to the site">
        {"[ ← back ]"}
      </Link>
      {s.stats && <div className={`${ink} ${paper} pointer-events-none fixed left-28 top-4 z-[60] px-1 text-[11px] text-[#6b655b]`}>{s.stats}</div>}

      <pre aria-label="Controls" className={`${ink} ${paper} pointer-events-none fixed bottom-4 right-4 z-[60] m-0 px-1 text-[11px] text-[#5a544a]`}>
        {controls.join("\n")}
      </pre>

      <div
        role="status"
        aria-live="polite"
        className={`${ink} ${paper} pointer-events-none fixed bottom-16 left-1/2 z-[60] -translate-x-1/2 px-2 py-0.5 text-[13px] italic transition-opacity duration-300`}
        style={{ opacity: s.caption ? 1 : 0 }}
      >
        {s.caption ? `~  ${s.caption}  ~` : ""}
      </div>
      <div className={`${ink} ${paper} pointer-events-none fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 px-1 transition-opacity duration-200`} style={{ opacity: s.prompt ? 1 : 0 }}>
        {"[ E ]  stroke the horse"}
      </div>

      <div ref={nameRef} className={`${ink} pointer-events-none fixed left-0 top-0 z-[60] text-[11px] font-semibold tracking-[0.2em]`} style={{ opacity: 0 }}>
        {playerName}
      </div>
    </>
  )
}
