# Library Page — Design

Route: `/library`. A pencil-sketched, animated drawing of Suraj's real bookshelf (three tall cabinets). You zoom into one shelf at a time, and every book on it opens into a sketched sheet with its cover, title, author, review and a samosa rating. Inspired by carollia-library.lovable.app (single row of spines, blurred detail panel) but reimagined as a drawn world, not a photo-effect UI.

## Intent
Make browsing the library feel like browsing a well-crafted animated 2D sketch of the actual shelves at home, not a product catalogue.

## Decided by Suraj
- Three cabinets, shown as a pencil-sketched drawing; the lines draw themselves in on load.
- Categories (13), filled left→right across the cabinets: Fantasy & Sci-Fi, English Classics, Modern English, Murakami, Japanese/Korean Lit, Russian Lit, Philosophy, History, Self-Help, Non-Fiction/Memoirs/Business, Indian Lit, Tech, Poetry.
- Browsing = zoom into one shelf at a time (click a shelf/category → eased zoom; back → zoom out).
- Books are pencil-drawn too (spines on the shelf).
- Every book is clickable/openable, including ones with no review.
- Opened book layout follows Carol's panel: cover left; label, title, author, blurb, rating, Previous/Next on the right. Backdrop is a sketched paper/whiteboard instead of blur.
- Cover: use `coverUrl` if present; if empty, draw a pencil cover from title+author.
- Blurb and review are optional; the panel collapses when absent (no empty gaps).
- Rating: 5 samosas. Given = yellow filled samosa (like `app/icon.png`: yellow triangle, orange spots) drawn in pencil style; not given = pencil outline only.
- Book data supplied later by Suraj as a document; books must be data-driven.

## Goals
- Feels hand-drawn and alive: wobbly double-stroke lines, paper grain, self-drawing on load, smooth zoom.
- Add/change a book by editing one data file; no redrawing.
- Works on phone and desktop, keyboard accessible, respects `prefers-reduced-motion`.

## Non-goals / anti-goals
- No 3D engine in the browser, no blur/glassmorphism, no generic typeset catalogue look. Not a photo of the shelf.
- No backend, accounts, waitlist, or "recommend a book" form (Carol's features, not asked for).
- Failure even if it "works": the lines look like clean vector UI instead of pencil.

## Claude's calls (not yet agreed — Suraj to review)
- **Medium:** procedural SVG pencil rendering (seeded jitter, feTurbulence displacement, stroke-dash self-draw) + GSAP for zoom/timelines. No Blender for v1; Blender may later produce a hero cabinet drawing.
- **Shelf map:** one category per shelf in reading order (cabinet 1→3, top→bottom), first 13 of 18 shelves; the remaining shelves stay as sketched empties/clutter. Three unplaced books go on an "Unsorted" shelf. Configurable in one array.
- Spine size (width/height) derived deterministically from title; spine lettering in a handwriting font; hatching/tint seeded per book.
- Page is full-viewport (fixed) with a small "back" link, since the site layout is a narrow column. Navbar + sitemap entries added.
- Detail panel: paper sheet (not whiteboard).
- Whole samosas only (no halves).
- Authors only filled in where certain; otherwise blank until Suraj's document.
- Cabinet drawing is stylised, not traced from the photo.
- No tests framework added; verification = typecheck, lint, build, browser screenshots.

## Data model (per book)
`id, title, author?, category, coverUrl?, description?, review?, rating?(0–5), status? ("Finished read" default), spine? {tint?}`

## Out of scope for v1
Search/filter, shelving workflow, real cover images, dark mode tuning.
