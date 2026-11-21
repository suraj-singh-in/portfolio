"use client"
// TEMPORARY harness for Task 10 — replaced by the real shell in Task 11.
import { useEffect, useRef, useState } from "react"

export default function LorePage() {
  const gl = useRef<HTMLCanvasElement>(null), paper = useRef<HTMLCanvasElement>(null)
  const [stats, setStats] = useState("loading…")
  useEffect(() => {
    let off = () => {}
    let alive = true
    import("./engine").then(({ createEngine }) => {
      if (!alive) return
      const e = createEngine({ gl: gl.current!, paper: paper.current! }, { debug: true, quality: new URLSearchParams(location.search).get("quality") })
      e.on("stats", setStats); e.on("progress", (p) => setStats(`loading ${Math.round(p * 100)}%`))
      e.start().catch((err) => setStats("error: " + err.message))
      off = () => e.dispose()
    })
    return () => { alive = false; off() }
  }, [])
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "#fbfaf6" }}>
      <canvas ref={paper} style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }} />
      <canvas ref={gl} style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }} />
      <div style={{ position: "fixed", top: 12, left: 16, font: "12px monospace", background: "#fbfaf6cc", padding: "2px 6px" }}>{stats}</div>
    </div>
  )
}
