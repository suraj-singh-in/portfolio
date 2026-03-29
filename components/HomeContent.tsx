"use client"

import { motion } from "framer-motion"
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

const linkHover = {
  hover: { x: 2, transition: { duration: 0.15, ease: "easeOut" } }
}

const iconHover = {
  hover: { x: 1, transition: { duration: 0.15 } }
}

export default function HomeContent() {
  return (
    <motion.section variants={container} initial="hidden" animate="visible">

      <motion.div variants={item}>
        <h1 className="mb-8 text-2xl font-semibold tracking-tighter text-neutral-900 dark:text-neutral-100">
          Suraj Singh
        </h1>
      </motion.div>

      <motion.div variants={item}>
        <p className="mb-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
          I'm a Software Development Engineer with nearly 4 years of experience in full-stack development.
          I currently work at{" "}
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            <a
              href="https://fynd.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors underline"
            >
              Fynd
            </a>
          </span>
          , where I engineer robust Offline POS clients and retail systems.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <p className="mb-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
          I specialize in building high-performance web applications using modern technologies like{" "}
          <motion.span
            className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded mx-1 text-neutral-900 dark:text-neutral-100 inline-block"
            whileHover={{ y: -1, transition: { duration: 0.15 } }}
          >
            Next.js
          </motion.span>
          ,{" "}
          <motion.span
            className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded mx-1 text-neutral-900 dark:text-neutral-100 inline-block"
            whileHover={{ y: -1, transition: { duration: 0.15 } }}
          >
            React Native
          </motion.span>
          , and{" "}
          <motion.span
            className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded mx-1 text-neutral-900 dark:text-neutral-100 inline-block"
            whileHover={{ y: -1, transition: { duration: 0.15 } }}
          >
            Node.js
          </motion.span>
          .
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
        <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center">
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
