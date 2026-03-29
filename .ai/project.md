# Portfolio Project — Project Overview

## Owner
**Suraj Singh** — Senior Software Engineer with 3.8+ years of full-stack experience.
Currently at **Fynd** (Aug 2024–Present). Previously at Freecharge and ProsperMe.

---

## What This Is
A personal portfolio website built with Next.js. It serves as a professional showcase, knowledge bank, and personal blog — all in one.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 (via PostCSS) |
| Icons | Lucide React 0.555.0 |
| Code Highlighting | react-syntax-highlighter (Prism, duotoneLight) |
| Font | Geist (sans + mono) |
| Linting | ESLint 9 + Next.js core-web-vitals |

---

## Folder Structure

```
/app
├── layout.tsx              # Root layout — wraps all pages with Navbar
├── page.tsx                # Homepage — hero + intro
├── globals.css             # Global Tailwind import + theme vars
├── /experience             # Work history, skills, achievements
├── /projects               # Portfolio project showcase (VaultRAG, Actor, MSI)
├── /blogs                  # Technical + personal writing
│   └── /computer-science
│       └── /web-workers-vs-service-workers-when-to-use-what
├── /compass                # Personal knowledge bank (CS, DSA, Recursion)
├── /manhattan-project      # Decade-long moonshot: Quantum Computing + AI
└── /credits                # Attribution page (Icons8 samosa icon)

/components
├── Navbar.tsx              # Sticky nav — desktop horizontal, mobile overlay hamburger
├── Footer.tsx              # Copyright + credits link
├── ListingComponent.tsx    # Categorized list renderer (supports internal + external links)
├── List.tsx                # Generic ordered/unordered list wrapper
└── SyntaxHighlighter.tsx   # Code block with Prism, dark background, line numbers
```

---

## Pages & Features

### Homepage (`/`)
- Hero with intro, current role, social CTA buttons (LinkedIn, GitHub, Email)
- Location indicator (MapPin icon)
- Fade-in + slide-up entry animation

### Experience (`/experience`)
- Timeline of 3 jobs: Fynd, Freecharge, ProsperMe
- Achievements: Fynd Stars, FC Warrior recognition
- Skills: 15 tags (React, React Native, Next.js, Node, Express, Docker, MongoDB, SQL, TypeScript, C++, Python, etc.)

### Projects (`/projects`)
- **VaultRAG** — RAG pipeline for Obsidian notes; supports OpenAI, Claude, Ollama
- **Actor** — API mocking service; 60% unit test coverage, Dockerized
- **MSI Power Website** — Freelance sustainables project

### Blogs (`/blogs`)
- CS Article: "Web Workers vs Service Workers" (fully rendered in-app with code blocks)
- External links: Jordan Peterson essay, Dune review, 400 Days review (all on Medium)

### Compass (`/compass`)
- Structured knowledge bank
- CS section → DSA → Recursion (hierarchical routing)

### Manhattan Project (`/manhattan-project`)
- Personal moonshot: master Quantum Computing + AI in a decade
- Currently learning: MIT OCW Linear Algebra

---

## Key Config Files

- `next.config.ts` — empty (all defaults)
- `postcss.config.mjs` — Tailwind CSS v4 PostCSS plugin
- `tsconfig.json` — strict, ES2017 target, `@/*` path alias
- `eslint.config.mjs` — Next.js core web vitals + TypeScript rules

---

## SEO / Metadata
- Root metadata: title "Suraj Singh", description with full tech stack
- Blog posts: OG tags, canonical URL, JSON-LD TechArticle schema

---

## Notes
- Dark mode supported via `prefers-color-scheme` media query + Tailwind `dark:` variants
- Navbar uses client-side pathname detection for active link styling
- `ListingComponent` auto-detects external URLs via `startsWith("http")`
