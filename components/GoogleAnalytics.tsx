"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip first render — GA auto-tracks the initial page view via the config call
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!GA_ID || typeof window.gtag === "undefined") return
    // Track subsequent client-side navigations
    window.gtag("config", GA_ID, { page_path: pathname })
  }, [pathname])

  if (!GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}
