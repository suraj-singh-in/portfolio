"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { BOOKS } from "../data/books"
import { assignShelves, ROWS } from "../lib/shelf-layout"
import Cabinets, { INK, PAPER, SHELF_RECTS, VIEW } from "./Cabinets"
import PencilDefs from "./PencilDefs"
import Spine, { packSpines } from "./Spine"
import BookSheet from "./BookSheet"

const hand = { fontFamily: "var(--font-hand), 'Segoe Print', cursive" }
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' seed='3'/><feColorMatrix values='0 0 0 0 0.2  0 0 0 0 0.2  0 0 0 0 0.2  0 0 0 0.07 0'/></filter><rect width='220' height='220' filter='url(#n)'/></svg>",
)}")`

type VB = { x: number; y: number; w: number; h: number }
const FULL: VB = { x: 0, y: 0, w: VIEW.w, h: VIEW.h }

export default function LibraryScene() {
  const shelves = useMemo(() => assignShelves(BOOKS), [])
  const placed = useMemo(() => shelves.map((s) => packSpines(s.books, SHELF_RECTS[s.index])), [shelves])

  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const vb = useRef<VB>({ ...FULL })
  const [active, setActive] = useState<number | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const applyVB = useCallback(() => {
    const v = vb.current
    svgRef.current?.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`)
  }, [])

  const target = useCallback((index: number | null): VB => {
    if (index === null) return { ...FULL }
    const el = wrapRef.current
    const aspect = el && el.clientHeight ? el.clientWidth / el.clientHeight : 16 / 9
    const r = SHELF_RECTS[index]
    const w = Math.max(r.w + 90, (r.h + 70) * aspect)
    const h = w / aspect
    return { x: r.x + r.w / 2 - w / 2, y: r.y + r.h / 2 - h / 2, w, h }
  }, [])

  const zoomTo = useCallback(
    (index: number | null) => {
      setActive(index)
      const t = target(index)
      gsap.killTweensOf(vb.current)
      if (reduced()) {
        Object.assign(vb.current, t)
        applyVB()
        return
      }
      gsap.to(vb.current, { ...t, duration: 1.1, ease: "power3.inOut", onUpdate: applyVB })
    },
    [applyVB, target],
  )

  // Draw the scene in on load.
  useGSAP(
    () => {
      if (reduced()) return
      gsap.fromTo(
        ".draw",
        { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 2.4, stagger: 0.18, ease: "power1.inOut", clearProps: "strokeDasharray,strokeDashoffset" },
      )
      gsap.from(".spine, .shelf-label", { opacity: 0, y: -14, duration: 0.7, stagger: 0.012, delay: 1.4, ease: "power2.out", clearProps: "opacity,transform" })
      gsap.from(".scene-title", { opacity: 0, duration: 1.2, delay: 0.4 })
    },
    { scope: wrapRef },
  )

  // Keep a zoomed shelf framed when the window is resized.
  useEffect(() => {
    const onResize = () => {
      if (active === null) return
      Object.assign(vb.current, target(active))
      applyVB()
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [active, applyVB, target])

  const activeBooks = active === null ? [] : placed[active].map((p) => p.book)
  const openIndex = activeBooks.findIndex((b) => b.id === openId)
  const openBook = openIndex >= 0 ? activeBooks[openIndex] : null
  const activeShelf = active === null ? null : shelves[active]

  // Reading order: left → right across the cabinets, then the next row down.
  const order = useMemo(
    () => [...shelves].sort((a, b) => a.row * 3 + a.cabinet - (b.row * 3 + b.cabinet)).map((s) => s.index),
    [shelves],
  )
  const gotoShelf = useCallback(
    (delta: number) => {
      if (active === null) return
      zoomTo(order[(order.indexOf(active) + delta + order.length) % order.length])
    },
    [active, order, zoomTo],
  )

  // Up / down: the shelf above or below, in the same cabinet. Stops at the top and bottom.
  const moveRow = useCallback(
    (delta: number) => {
      if (active === null) return
      const row = active % ROWS
      if (row + delta < 0 || row + delta >= ROWS) return
      zoomTo(active + delta)
    },
    [active, zoomTo],
  )

  // Keyboard: Esc zooms out; arrows change shelf (when no book sheet is open).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (openId !== null || active === null) return
      if (e.key === "Escape") zoomTo(null)
      else if (e.key === "ArrowLeft") gotoShelf(-1)
      else if (e.key === "ArrowRight") gotoShelf(1)
      else if (e.key === "ArrowUp") {
        e.preventDefault()
        moveRow(-1)
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        moveRow(1)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, openId, zoomTo, gotoShelf, moveRow])

  // Gestures: left/right swipe → previous/next shelf; up/down swipe → shelf below/above (touch or mouse drag).
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)
  const wheelAcc = useRef({ x: 0, y: 0, lock: false })
  const gesturesOn = active !== null && openId === null

  const onPointerDown = (e: React.PointerEvent) => {
    swipe.current = gesturesOn ? { x: e.clientX, y: e.clientY } : null
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s || !gesturesOn) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    const horizontal = Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5
    const vertical = Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.5
    if (!horizontal && !vertical) return
    swiped.current = true
    setTimeout(() => (swiped.current = false), 60) // swallow the click that follows a drag
    if (horizontal) gotoShelf(dx < 0 ? 1 : -1)
    else moveRow(dy < 0 ? 1 : -1) // swipe up → shelf below
  }
  // Trackpad / mouse wheel: sideways scroll changes shelf, up/down scroll changes row.
  const onWheel = (e: React.WheelEvent) => {
    if (!gesturesOn) return
    const w = wheelAcc.current
    if (w.lock) return
    w.x += e.deltaX
    w.y += e.deltaY
    const horizontal = Math.abs(w.x) > 90 && Math.abs(w.x) > Math.abs(w.y)
    const vertical = Math.abs(w.y) > 90 && Math.abs(w.y) >= Math.abs(w.x)
    if (!horizontal && !vertical) return
    if (horizontal) gotoShelf(w.x > 0 ? 1 : -1)
    else moveRow(w.y > 0 ? 1 : -1)
    w.x = 0
    w.y = 0
    w.lock = true
    setTimeout(() => (w.lock = false), 900)
  }

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-10 overflow-hidden"
      style={{ background: PAPER, touchAction: gesturesOn ? "none" : "auto", overscrollBehavior: "none" }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipe.current = null)}
      onWheel={onWheel}
      onClickCapture={(e) => {
        if (swiped.current) {
          e.stopPropagation()
          e.preventDefault()
        }
      }}
    >
      <style>{`
        .spine{transition:transform .25s ease;cursor:default;outline:none}
        .spine:not(.spine-live){pointer-events:none}
        .spine-live{cursor:pointer}
        .spine-live:hover,.spine-live:focus-visible{transform:translateY(-7px)}
        .shelf-hit{fill:transparent;cursor:pointer;transition:fill .2s ease;outline:none}
        .shelf-hit:hover,.shelf-hit:focus-visible{fill:rgba(128,128,128,.12)}
        @media (prefers-color-scheme: dark){.lib-grain{display:none}}
      `}</style>

      <svg
        ref={svgRef}
        viewBox={`${FULL.x} ${FULL.y} ${FULL.w} ${FULL.h}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label="Sketch of Suraj's bookshelves. Choose a shelf to look closer."
      >
        <PencilDefs />

        <g style={{ pointerEvents: "none", opacity: active === null ? 1 : 0, transition: "opacity .4s ease" }}>
          <g className="scene-title">
            <text x="100" y="92" fontSize="64" fill={INK} style={hand}>
              the library
            </text>
            <text x="104" y="124" fontSize="22" fill={INK} opacity="0.6" style={hand}>
              {BOOKS.length} books · pick a shelf to look closer
            </text>
          </g>
        </g>

        <Cabinets />

        {shelves.map((s) => {
          const r = SHELF_RECTS[s.index]
          const isActive = active === s.index
          return (
            <g key={s.index} style={{ opacity: active === null || isActive ? 1 : 0.28, transition: "opacity .6s ease" }}>
              {s.category && (
                <text className="shelf-label" x={r.x + 12} y={r.y + 17} fontSize="15" fill={INK} opacity="0.75" style={{ ...hand, pointerEvents: "none" }}>
                  {s.category}
                </text>
              )}
              {isActive && s.books.length === 0 && (
                <text x={r.x + r.w / 2} y={r.y + r.h / 2} fontSize="20" fill={INK} opacity="0.5" textAnchor="middle" style={hand}>
                  an empty shelf, room to grow
                </text>
              )}
              {placed[s.index].map((p) => (
                <Spine key={p.book.id} spine={p} bottom={r.y + r.h} interactive={isActive} onOpen={setOpenId} />
              ))}
              {!isActive && (
                <rect
                  className="shelf-hit"
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h + 12}
                  role="button"
                  tabIndex={0}
                  aria-label={s.category ? `Open the ${s.category} shelf` : `Open empty shelf ${s.index + 1}`}
                  onClick={() => zoomTo(s.index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      zoomTo(s.index)
                    }
                  }}
                />
              )}
            </g>
          )
        })}
      </svg>

      {/* paper grain, tiled once, never re-rendered during zoom */}
      <div className="lib-grain pointer-events-none absolute inset-0" style={{ backgroundImage: GRAIN, mixBlendMode: "multiply" }} />

      {active !== null && activeShelf && (
        <>
          <button
            type="button"
            onClick={() => zoomTo(null)}
            className="absolute left-4 top-4 z-20 text-2xl underline-offset-4 hover:underline md:left-8 md:top-6"
            style={{ ...hand, color: INK }}
          >
            ← all shelves
          </button>
          <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-6 text-xl" style={{ ...hand, color: INK }}>
            <button type="button" onClick={() => gotoShelf(-1)} className="underline-offset-4 hover:underline" aria-label="Previous shelf">
              ‹ previous shelf
            </button>
            <span className="opacity-60">{activeShelf.category ?? "empty shelf"}</span>
            <button type="button" onClick={() => gotoShelf(1)} className="underline-offset-4 hover:underline" aria-label="Next shelf">
              next shelf ›
            </button>
          </div>
        </>
      )}

      {openBook && (
        <BookSheet
          key={openBook.id}
          book={openBook}
          onClose={() => setOpenId(null)}
          onPrev={openIndex > 0 ? () => setOpenId(activeBooks[openIndex - 1].id) : undefined}
          onNext={openIndex < activeBooks.length - 1 ? () => setOpenId(activeBooks[openIndex + 1].id) : undefined}
        />
      )}
    </div>
  )
}
