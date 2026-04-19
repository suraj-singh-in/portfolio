"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Search, X } from "lucide-react"
import type { IList } from "@/components/ListingComponent"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.15, ease: "easeIn" } },
}

const sectionVariants: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.18, ease: "easeIn" } },
}

export default function BlogSearch({ list }: { list: IList }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const openSearch = () => setIsOpen(true)
  const closeSearch = () => {
    setIsOpen(false)
    setQuery("")
  }

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeSearch() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const q = query.trim().toLowerCase()

  const filtered = list.sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          section.title.toLowerCase().includes(q)
      ),
    }))
    .filter((section) => section.items.length > 0)

  const totalResults = filtered.reduce((n, s) => n + s.items.length, 0)

  return (
    <div>

      {/* ── HEADER ── */}
      <header className="mb-8">

        {/* Title row — fixed height so the page doesn't jump */}
        <div className="relative flex items-center h-9 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>

            {/* Blogs title + search icon */}
            {!isOpen && (
              <motion.div
                key="title"
                className="absolute inset-0 flex items-center gap-2"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22, ease: EASE }}
              >
                <h1 className="font-semibold text-2xl tracking-tighter text-neutral-900 dark:text-neutral-100">
                  Blogs
                </h1>
                <motion.button
                  type="button"
                  aria-label="Search posts"
                  onClick={openSearch}
                  className="p-1 rounded-md text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.12 }}
                >
                  <motion.span
                    className="block"
                    animate={{ rotate: [0, -15, 15, -8, 8, 0] }}
                    transition={{
                      duration: 0.55,
                      delay: 1.8,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 5,
                    }}
                  >
                    <Search size={16} strokeWidth={2} />
                  </motion.span>
                </motion.button>
              </motion.div>
            )}

            {/* Search input + close */}
            {isOpen && (
              <motion.div
                key="search"
                className="absolute inset-0 flex items-center gap-2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.22, ease: EASE }}
              >
                <Search
                  size={14}
                  strokeWidth={2}
                  className="shrink-0 text-neutral-400 dark:text-neutral-500"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posts…"
                  className="flex-1 bg-transparent text-2xl font-semibold tracking-tighter
                             text-neutral-900 dark:text-neutral-100
                             placeholder:text-neutral-300 dark:placeholder:text-neutral-700
                             placeholder:font-semibold placeholder:tracking-tighter
                             focus:outline-none"
                />
                <motion.button
                  type="button"
                  aria-label="Close search"
                  onClick={closeSearch}
                  className="shrink-0 p-1 rounded-md text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.12 }}
                >
                  <X size={16} strokeWidth={2} />
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Subtitle — fades away while searching */}
        <AnimatePresence initial={false}>
          {!isOpen && (
            <motion.p
              key="subtitle"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="text-neutral-600 dark:text-neutral-400 mt-1 text-sm font-medium overflow-hidden"
            >
              By Suraj Singh
            </motion.p>
          )}
        </AnimatePresence>

      </header>

      {/* ── RESULTS ── */}
      <div className="flex flex-col gap-10">
        <AnimatePresence mode="popLayout" initial={false}>

          {filtered.length > 0 ? (
            filtered.map((section) => (
              <motion.div
                key={section.title}
                layout
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col"
              >
                <div className="flex justify-between items-baseline mb-2">
                  <h2 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">
                    {section.title}
                  </h2>
                </div>

                <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {section.items.map((item) => {
                      const isExternal = item.url.startsWith("http")
                      return (
                        <motion.li
                          key={item.url}
                          layout
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="font-medium"
                        >
                          {isExternal ? (
                            <a href={item.url} className="underline" target="_blank" rel="noreferrer">
                              {item.title}
                            </a>
                          ) : (
                            <Link href={item.url} className="underline">
                              {item.title}
                            </Link>
                          )}
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>

                <hr className="mt-4 border-neutral-100 dark:border-neutral-800" />
              </motion.div>
            ))
          ) : (
            <motion.p
              key="empty"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-sm text-neutral-400 dark:text-neutral-600"
            >
              No posts match &ldquo;{query}&rdquo;.
            </motion.p>
          )}

        </AnimatePresence>
      </div>

      {/* Result count — visible only while filtering */}
      <AnimatePresence>
        {q.length > 0 && (
          <motion.p
            key="count"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 text-xs text-neutral-400 dark:text-neutral-600"
          >
            {totalResults} {totalResults === 1 ? "post" : "posts"} found
          </motion.p>
        )}
      </AnimatePresence>

    </div>
  )
}
