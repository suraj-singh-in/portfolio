"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { Book } from "../data/books"
import { mulberry32, sketchRect } from "../lib/pencil"
import PencilCover from "./PencilCover"
import Rating from "./Samosa"

const INK = "currentColor"
const hand = { fontFamily: "var(--font-hand), 'Segoe Print', cursive" }

type Props = {
  book: Book
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

export default function BookSheet({ book, onClose, onPrev, onNext }: Props) {
  const [coverFailed, setCoverFailed] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const border = useMemo(() => sketchRect(6, 6, 988, 588, mulberry32(77), 2.2, 2), [])

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => prevFocus?.focus?.()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowLeft" && onPrev) onPrev()
      else if (e.key === "ArrowRight" && onNext) onNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, onPrev, onNext])

  const showImage = Boolean(book.coverUrl) && !coverFailed

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto p-4"
      style={{ background: "var(--lib-veil)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={book.title}
    >
      <div
        className="relative my-auto w-full max-w-4xl px-7 py-9 md:px-12 md:py-12"
        style={{ background: "var(--lib-sheet)", color: "var(--lib-ink)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={border}
            fill="none"
            stroke={INK}
            strokeWidth={1.6}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            filter="url(#pencil-wobble)"
          />
        </svg>
        {/* masking tape */}
        <span className="pointer-events-none absolute -top-3 left-8 h-6 w-20 -rotate-6" style={{ background: "var(--lib-tape)" }} />
        <span className="pointer-events-none absolute -top-3 right-8 h-6 w-20 rotate-6" style={{ background: "var(--lib-tape)" }} />

        <div className="relative grid gap-8 md:grid-cols-[minmax(0,260px)_1fr] md:gap-12">
          <div className="mx-auto w-full max-w-[260px]">
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                onError={() => setCoverFailed(true)}
                className="block h-auto w-full"
                style={{ filter: "grayscale(0.35) contrast(0.95)", boxShadow: "3px 4px 0 rgba(128,128,128,0.35)" }}
              />
            ) : (
              <PencilCover title={book.title} author={book.author} />
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] opacity-60">
              {book.status ?? "Finished read"} · {book.category}
            </p>
            <h2 className="text-4xl leading-tight md:text-5xl" style={hand}>
              {book.title}
            </h2>
            {book.author && (
              <p className="text-2xl opacity-75" style={hand}>
                {book.author}
              </p>
            )}
            {book.description && <p className="max-w-prose text-[15px] leading-relaxed opacity-80">{book.description}</p>}
            {book.review && (
              <div className="border-l-2 pl-4" style={{ borderColor: INK }}>
                <p className="text-lg opacity-60" style={hand}>
                  my review
                </p>
                <p className="max-w-prose text-[15px] leading-relaxed">{book.review}</p>
              </div>
            )}
            <Rating value={book.rating} />

            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[12px] uppercase tracking-[0.18em]">
              <button type="button" onClick={onPrev} disabled={!onPrev} className="underline-offset-4 hover:underline disabled:opacity-30">
                ← previous
              </button>
              <button type="button" onClick={onNext} disabled={!onNext} className="underline-offset-4 hover:underline disabled:opacity-30">
                next →
              </button>
              <button ref={closeRef} type="button" onClick={onClose} className="ml-auto underline-offset-4 hover:underline">
                close ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
