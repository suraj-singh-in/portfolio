"use client"

import Link from "next/link"
import type { RefObject } from "react"

export type HudState = {
  caption: string | null
  prompt: boolean
  muted: boolean | null
  stats: string | null
}

const box = "pointer-events-none fixed z-[60] rounded bg-[#fbfaf6]/85 px-2 py-1 font-mono text-xs text-neutral-800"

/** DOM overlay above the canvas: back link, controls hint, caption, interact prompt, name label, mute state. */
export default function Hud({ s, playerName, nameRef }: { s: HudState; playerName: string; nameRef: RefObject<HTMLDivElement | null> }) {
  return (
    <>
      <Link href="/" className="fixed left-4 top-4 z-[60] rounded bg-[#fbfaf6]/85 px-2 py-1 font-mono text-xs text-neutral-800 hover:underline">
        ← back
      </Link>
      {s.stats && <div className={`${box} left-20 top-4`}>{s.stats}</div>}
      <div className={`${box} bottom-4 right-4 text-right text-neutral-500`}>
        WASD / arrows — walk · shift — run · E — stroke the horse
        <br />
        scroll or + / − — zoom · M — {s.muted === null ? "no sound" : s.muted ? "unmute" : "mute"}
      </div>
      <div className={`${box} bottom-14 left-1/2 -translate-x-1/2 text-[13px] transition-opacity duration-300`} style={{ opacity: s.caption ? 1 : 0 }}>
        {s.caption ?? ""}
      </div>
      <div className={`${box} bottom-6 left-1/2 -translate-x-1/2 transition-opacity duration-200`} style={{ opacity: s.prompt ? 1 : 0 }}>
        E — stroke the horse
      </div>
      <div
        className="pointer-events-none fixed left-0 top-0 z-[60] whitespace-nowrap font-mono text-[11px] font-semibold tracking-wide text-[#2a2722]"
        ref={nameRef}
        style={{ opacity: 0 }}
      >
        {playerName}
      </div>
    </>
  )
}
