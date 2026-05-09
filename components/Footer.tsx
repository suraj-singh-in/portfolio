"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

const REAL_YEAR = new Date().getFullYear()
const CHARS = "0123456789"
const TICK_INTERVAL = 60  // ms between flickers

function useScrambleYear() {
  const [display, setDisplay] = useState(String(REAL_YEAR))
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pausedRef = useRef(false)

  const start = () => {
    if (tickRef.current) return
    tickRef.current = setInterval(() => {
      if (pausedRef.current) return
      setDisplay(
        String(REAL_YEAR)
          .split("")
          .map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
          .join("")
      )
    }, TICK_INTERVAL)
  }

  const pause = () => {
    pausedRef.current = true
    setDisplay(String(REAL_YEAR))
  }

  const resume = () => {
    pausedRef.current = false
  }

  useEffect(() => {
    start()
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [])

  return { display, pause, resume }
}

const Footer = () => {
  const { display, pause, resume } = useScrambleYear()

  return (
    <motion.footer
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="pt-8 border-t border-neutral-100 dark:border-neutral-800 flex justify-between text-neutral-500 dark:text-neutral-400 text-sm"
    >
      <span>
        ©{" "}
        <span
          className="font-mono cursor-default select-none"
          onMouseEnter={pause}
          onMouseLeave={resume}
        >
          {display}
        </span>
        {" "}Suraj Singh · Not a Second Hand Life
      </span>
      <div className="flex space-x-4">
        <motion.span className="relative" whileHover="hover">
          <Link href="/compass">compass</Link>
          <motion.span
            className="absolute bottom-0 left-0 h-[1px] w-full bg-neutral-400 dark:bg-neutral-500"
            variants={{
              initial: { scaleX: 0, originX: 0 },
              hover: { scaleX: 1 },
            }}
            initial="initial"
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </motion.span>
        <motion.span className="relative" whileHover="hover">
          <Link href="/credits">credits</Link>
          <motion.span
            className="absolute bottom-0 left-0 h-[1px] w-full bg-neutral-400 dark:bg-neutral-500"
            variants={{
              initial: { scaleX: 0, originX: 0 },
              hover: { scaleX: 1 },
            }}
            initial="initial"
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </motion.span>
      </div>
    </motion.footer>
  )
}

export default Footer
