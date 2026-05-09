"use client"

import { motion, type Variants } from "framer-motion"
import { Github, Linkedin, Mail, MapPin } from 'lucide-react'
import Footer from '@/components/Footer'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } }
}

// LCP-safe variant: no opacity fade so the h1 is paint-visible on first SSR render
const itemSlide = {
  hidden: { y: 10 },
  visible: { y: 0, transition: { duration: 0.35, ease: EASE } }
}

const currently = [
  { type: "listening", label: "Love Will Tear Us Apart",     detail: "Joy Division" },
  { type: "reading",   label: "The Brothers Karamazov",      detail: "Fyodor Dostoevsky" },
  { type: "thinking",  label: "whether karma is debt or just memory the soul carries", detail: null },
  { type: "listening", label: "Chaand Aawara",               detail: "Shrey Gupta & Swanand Kirkire" },
  { type: "reading",   label: "Notes from Underground",      detail: "Fyodor Dostoevsky" },
  { type: "thinking",  label: "what the Gita means by action without the doer",        detail: null },
  { type: "listening", label: "Beqaaboo",                    detail: "Rumii & Krameri" },
  { type: "reading",   label: "Letters from a Stoic",        detail: "Seneca" },
  { type: "thinking",  label: "Neti Neti — and what remains when you stop naming things", detail: null },
  { type: "listening", label: "Jaane Kyon Log Pyar",         detail: "Udit Narayan & Alka Yagnik" },
  { type: "reading",   label: "The Prophet",                 detail: "Kahlil Gibran" },
  { type: "listening", label: "Nazara",                      detail: "Raf Saperra" },
] as const

const week = Math.floor(Date.now() / 604800000)
const current = currently[week % currently.length]

const prefixMap: Record<string, string> = {
  listening: "Currently listening to",
  reading:   "Currently reading",
  thinking:  "Currently thinking about",
}

const linkHover: Variants = {
  hover: { x: 2, transition: { duration: 0.15, ease: "easeOut" } }
}

const iconHover: Variants = {
  hover: { x: 1, transition: { duration: 0.15 } }
}

export default function HomeContent() {
  return (
    <motion.section variants={container} initial="hidden" animate="visible">

      <motion.div variants={itemSlide}>
        <h1 className="mb-1 text-2xl font-semibold tracking-tighter text-neutral-900 dark:text-neutral-100">
          Suraj Singh
        </h1>
        <p className="mb-8 text-sm text-neutral-400 dark:text-neutral-500 tracking-wide">
          Software Engineer · Delhi
        </p>
      </motion.div>

      <motion.div variants={item}>
        <p className="mb-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
          I&apos;m a software engineer based in Delhi. I build things that work even when the internet
          doesn&apos;t — offline-first retail systems, RAG pipelines, developer tools.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <p className="mb-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
          I work at{" "}
          <a
            href="https://fynd.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            Fynd
          </a>
          , where I cut average POS order time from 1 minute to 20 seconds.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <p className="mb-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
          By day I write code. By night I research philosophy and Indian history, and slowly,
          painfully, write fiction — starting with{" "}
          <a
            href="https://medium.com/@singh.suraj/court-of-the-grim-reaper-introduction-3d4c919a89a0"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            a story
          </a>{" "}
          about arguing your case before the Grim Reaper. I have a weakness for Sufi mystics,
          half-finished stories, and books I&apos;ll never stop recommending.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <p className="mb-4 text-xs text-neutral-400 dark:text-neutral-500 tracking-wide">
          {prefixMap[current.type]} —{" "}
          <span className="text-neutral-500 dark:text-neutral-400">
            {current.label}
            {current.detail && (
              <span className="text-neutral-400 dark:text-neutral-500"> by {current.detail}</span>
            )}
          </span>
        </p>
      </motion.div>

      <motion.div variants={item} className="my-8 flex flex-col space-y-4 w-full">
        <h2 className="font-semibold text-xl tracking-tight text-neutral-900 dark:text-neutral-100">Connect</h2>
        <div className="flex flex-wrap gap-4 text-neutral-600 dark:text-neutral-400">
          <motion.a
            href="https://linkedin.com/in/suraj-singh-in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            whileHover="hover"
            variants={linkHover}
          >
            <motion.span variants={iconHover} className="mr-2 flex items-center">
              <Linkedin size={16} />
            </motion.span>
            LinkedIn
          </motion.a>
          <motion.a
            href="https://github.com/suraj-singh-in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            whileHover="hover"
            variants={linkHover}
          >
            <motion.span variants={iconHover} className="mr-2 flex items-center">
              <Github size={16} />
            </motion.span>
            GitHub
          </motion.a>
          <motion.a
            href="mailto:suraj.singh.in.delhi@gmail.com"
            className="flex items-center hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            whileHover="hover"
            variants={linkHover}
          >
            <motion.span variants={iconHover} className="mr-2 flex items-center">
              <Mail size={16} />
            </motion.span>
            Email
          </motion.a>
        </div>
      </motion.div>

      <motion.div variants={item} className="prose prose-neutral dark:prose-invert">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center pb-2">
          <motion.span
            className="mr-1 flex items-center"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
          >
            <MapPin size={14} />
          </motion.span>
          Delhi, India
        </p>
      </motion.div>

      <Footer />

    </motion.section>
  )
}
