"use client"

import { useEffect, useRef, useState } from "react"
import { CONFIG } from "./engine/config"
import type { Engine } from "./engine"
import DesktopOnly from "./ui/DesktopOnly"
import Hud, { type HudState } from "./ui/Hud"
import LoadingScreen from "./ui/LoadingScreen"
import { detectWebGL } from "./ui/detectWebGL"
import { isDesktop } from "./ui/isDesktop"

type Mode = "checking" | "scene" | "small" | "webgl" | "error"

const CAPTION_MS = 3400

export default function LoreClient() {
  const [mode, setMode] = useState<Mode>("checking")
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const [hud, setHud] = useState<HudState>({ caption: null, prompt: false, muted: null, name: { x: 0, y: 0, opacity: 0 }, playerName: CONFIG.PLAYER_NAME, stats: null })
  const glRef = useRef<HTMLCanvasElement>(null)
  const paperRef = useRef<HTMLCanvasElement>(null)

  // desktop gate: re-evaluated on resize and pointer-type changes
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)")
    const params = new URLSearchParams(window.location.search)
    const forceNoGL = params.has("debug") && params.has("nowebgl")
    const evaluate = () => {
      if (!isDesktop({ width: window.innerWidth, coarsePointer: coarse.matches })) return setMode("small")
      if (forceNoGL || !detectWebGL(() => document.createElement("canvas"))) return setMode("webgl")
      setMode((m) => (m === "error" ? m : "scene"))
    }
    evaluate()
    window.addEventListener("resize", evaluate)
    coarse.addEventListener("change", evaluate)
    return () => { window.removeEventListener("resize", evaluate); coarse.removeEventListener("change", evaluate) }
  }, [])

  // exactly one engine while the scene is shown; disposed when leaving the page or the gate closes
  useEffect(() => {
    if (mode !== "scene") return
    let engine: Engine | null = null
    let alive = true
    let captionTimer = 0
    setReady(false); setProgress(0)
    const params = new URLSearchParams(window.location.search)
    import("./engine").then(({ createEngine }) => {
      if (!alive || !glRef.current || !paperRef.current) return
      engine = createEngine({ gl: glRef.current, paper: paperRef.current }, { debug: params.has("debug"), quality: params.get("quality") })
      engine.on("progress", setProgress)
      engine.on("ready", () => setReady(true))
      engine.on("prompt", (prompt) => setHud((h) => ({ ...h, prompt })))
      engine.on("mute", (muted) => setHud((h) => ({ ...h, muted })))
      engine.on("name", (name) => setHud((h) => ({ ...h, name })))
      engine.on("stats", (stats) => setHud((h) => ({ ...h, stats })))
      engine.on("caption", (caption) => {
        setHud((h) => ({ ...h, caption }))
        window.clearTimeout(captionTimer)
        captionTimer = window.setTimeout(() => setHud((h) => ({ ...h, caption: null })), CAPTION_MS)
      })
      engine.on("error", () => setMode("error"))
      engine.start().catch(() => { if (alive) setMode("error") })
    }).catch(() => { if (alive) setMode("error") })
    return () => { alive = false; window.clearTimeout(captionTimer); engine?.dispose(); engine = null }
  }, [mode])

  if (mode === "checking") return <div className="fixed inset-0 z-[70] bg-[#fbfaf6]" />
  if (mode !== "scene") return <DesktopOnly reason={mode} />

  return (
    <div className="fixed inset-0 z-[55] overflow-hidden bg-[#fbfaf6]">
      <canvas ref={paperRef} className="fixed inset-0 block h-screen w-screen" aria-hidden />
      <canvas ref={glRef} className="fixed inset-0 block h-screen w-screen" aria-label="A walkable scene: a hut, a fire and a horse in a forest clearing" />
      <Hud s={hud} />
      <LoadingScreen text={CONFIG.LORE_LOADING_TEXT} progress={progress} done={ready} />
    </div>
  )
}
