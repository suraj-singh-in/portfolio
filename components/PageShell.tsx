"use client"

import { motion } from "framer-motion"

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ y: 12 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      {children}
    </motion.section>
  )
}
