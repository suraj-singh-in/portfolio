# Library Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/library`: a pencil-sketched, animated drawing of three bookcases where you zoom into one shelf at a time and open any book into a sketched sheet with a samosa rating.

**Architecture:** One SVG scene. Pure helpers produce seeded wobbly pencil geometry; React components render cabinets, shelves and spines from a typed book array; GSAP tweens the SVG `viewBox` to zoom shelves and draws strokes via dash-offset. The book sheet is a DOM overlay. Data lives in one file.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4, `gsap` + `@gsap/react` (new), Google font via `next/font` for handwriting.

**Spec:** `docs/superpowers/specs/2026-11-11-library-page-design.md`

## Global Constraints

- Full-viewport fixed page (root layout is a `max-w-2xl` column); small "back" link; no blur / glass effects.
- Pencil look: graphite strokes on warm paper, double-stroke wobble, no clean vector lines.
- Rating = 5 whole samosas; given = yellow fill + orange spots, not given = pencil outline.
- Cover: `coverUrl` if set, else pencil-drawn cover from title + author.
- Blurb, review, author, rating all optional; the sheet collapses empty parts.
- Category order (left→right, top→bottom): Fantasy & Sci-Fi, English Classics, Modern English, Murakami, Japanese/Korean Lit, Russian Lit, Philosophy, History, Self-Help, Non-Fiction / Memoirs / Business, Indian Lit, Tech, Poetry; plus "Unsorted".
- Respect `prefers-reduced-motion`; keyboard operable (Esc closes, arrows prev/next); real DOM list as accessible fallback.
- No commits by the agent (user commits manually). No test framework exists; verify with `npx tsc --noEmit`, `npm run lint`, `npm run build`, and browser screenshots.
- TypeScript strict, no `any`; alias `@/*` = repo root.

## Review Focus

- Book with no author/description/review/rating/coverUrl renders a complete sheet (no "undefined", no empty gaps).
- Very long titles (e.g. "Welcome to the Hyunam-dong Bookshop: The Heart-warming Korean Sensation") fit or truncate on a spine without overflowing the shelf.
- A category with 0 books (Poetry placeholder, Russian) draws an empty labelled shelf and zoom still works.
- A shelf with more books than fit overflows gracefully (spines get narrower or wrap to a second row) instead of leaving the cabinet.
- Mobile width (~390px): shelf zoom fills the screen and sheet stacks cover above text.
- Reduced motion: scene appears fully drawn, zoom is instant.

---

## File Structure

```
app/library/
  page.tsx                 — route, metadata, mounts <LibraryScene/>
  data/books.ts            — Book type, CATEGORIES, BOOKS
  lib/shelf-layout.ts      — assignShelves(): books → 18 shelf slots
  lib/pencil.ts            — seeded rng + wobble geometry helpers
  components/PencilDefs.tsx    — SVG filters (displacement, grain)
  components/Cabinets.tsx      — draws 3 cabinets, exposes SHELF_RECTS
  components/Spine.tsx         — one pencil spine
  components/LibraryScene.tsx  — SVG host, zoom state, GSAP
  components/Samosa.tsx        — pencil/filled samosa + Rating
  components/PencilCover.tsx   — fallback cover
  components/BookSheet.tsx     — paper overlay with details
  components/ShelfList.tsx     — visually-hidden accessible list
components/Navbar.tsx      — add "library"
app/sitemap.ts             — add /library
```

### Task 1: Dependencies, data model, shelf assignment

**Files:** Create `app/library/data/books.ts`, `app/library/lib/shelf-layout.ts`; modify `package.json` (via npm).

**Interfaces — Produces:**
- `type Book = { id: string; title: string; author?: string; category: CategoryName; coverUrl?: string; description?: string; review?: string; rating?: 0|1|2|3|4|5; status?: string }`
- `CATEGORIES: readonly CategoryName[]`, `BOOKS: Book[]`
- `type Shelf = { index: number; cabinet: 0|1|2; row: number; category: CategoryName | null; books: Book[] }`
- `assignShelves(books: Book[]): Shelf[]` — returns exactly 18 shelves (cabinet 0–2 × row 0–5).

- [ ] **Step 1:** `npm install gsap @gsap/react`.
- [ ] **Step 2:** Write `books.ts` with all ~74 titles from the conversation (authors only where certain), `id` = slug of title, categories per the agreed mapping; the three unplaced books under "Unsorted".
- [ ] **Step 3:** Implement `assignShelves`: shelf index = cabinet·6 + row; categories fill indices 0..13 in order (Unsorted last); remaining shelves have `category: null`, `books: []`; books keep source order within a category.
- [ ] **Step 4:** `npx tsc --noEmit` → no errors. Quick node/tsx-free sanity: temporary `console.log` not needed; verified visually in Task 5.

### Task 2: Pencil primitives

**Files:** Create `app/library/lib/pencil.ts`, `app/library/components/PencilDefs.tsx`.

**Interfaces — Produces:**
- `mulberry32(seed: number): () => number`; `hashString(s: string): number`
- `wobbleLine(x1,y1,x2,y2, rand: () => number, amp?: number): string` — SVG path `d`, one slightly curved stroke
- `sketchRect(x,y,w,h, rand, amp?): string` — path of four wobbly sides, overshooting corners
- `<PencilDefs/>` — defines `#pencil-wobble` (feTurbulence + feDisplacementMap, small scale) and `#paper-grain`.

- [ ] **Step 1:** Implement the above; deterministic for a given seed.
- [ ] **Step 2:** `npx tsc --noEmit` clean.

### Task 3: Cabinets drawing

**Files:** Create `app/library/components/Cabinets.tsx`.

**Interfaces — Consumes:** pencil.ts. **Produces:** `VIEW = { w: 1600, h: 1100 }`, `SHELF_RECTS: {x,y,w,h}[]` (18 entries, index = cabinet·6 + row, the interior of each shelf slot), `<Cabinets/>` rendering three cabinets side by side (outer frame, 5 dividers, top ledge, feet) with class `draw` on every stroke path for self-drawing.

- [ ] **Step 1:** Implement with seeded wobbly strokes, proportions from the photo (tall, 6 shelves, equal width).
- [ ] **Step 2:** Mount temporarily in the page (Task 8) and screenshot to confirm it reads as three bookcases.

### Task 4: Spines

**Files:** Create `app/library/components/Spine.tsx`.

**Interfaces — Produces:** `<Spine book: Book, x: number, shelfBottom: number, height: number, width: number, onOpen: (id: string) => void />`; `spineSize(book: Book): { w: number; h: number }` deterministic from `hashString(title)` (width 14–30, height 70–95% of shelf height).

- [ ] **Step 1:** Pencil outline + hatching fill (seeded), title lettered vertically in the handwriting font, truncated with "…" if longer than the spine.
- [ ] **Step 2:** Hover lifts the spine a few px; focusable `<g role="button" tabIndex=0 aria-label=title>`; Enter/Space opens.
- [ ] **Step 3:** Packing helper `packSpines(books, shelfRect)` places left→right and shrinks widths proportionally if total exceeds shelf width (Review Focus: overflow).

### Task 5: Scene, zoom, category labels

**Files:** Create `app/library/components/LibraryScene.tsx`.

**Interfaces — Consumes:** `assignShelves`, `SHELF_RECTS`, `Cabinets`, `Spine`. **Produces:** `<LibraryScene/>` — SVG with viewBox state; click a shelf (or its handwritten category label) tweens viewBox to that shelf's rect (padded) with `gsap.to`; "← all shelves" button and Esc zoom out; draw-in on load via stroke-dashoffset; reduced-motion = instant.

- [ ] **Step 1:** Implement scene with handwritten category labels beside each filled shelf.
- [ ] **Step 2:** Zoom in/out works for all 18 shelves including empty ones (Review Focus).
- [ ] **Step 3:** Screenshot full view + one zoomed shelf; fix anything that doesn't look pencil.

### Task 6: Samosa rating and pencil cover

**Files:** Create `Samosa.tsx`, `PencilCover.tsx`.

**Interfaces — Produces:** `<Rating value?: 0..5 />` (5 samosas; `undefined` renders "Unrated" text), `<PencilCover title: string, author?: string />` (seeded sketched cover with title lettering).

- [ ] **Step 1:** Samosa path from `app/icon.png` shape (rounded triangle, orange spots, small face optional); filled = `#f6c945` with `#e8892b` spots; outline = graphite stroke through `#pencil-wobble`.
- [ ] **Step 2:** Render all rating states 0–5 + undefined in the sheet to confirm.

### Task 7: Book sheet

**Files:** Create `BookSheet.tsx`.

**Interfaces — Consumes:** `Book`, `Rating`, `PencilCover`. **Produces:** `<BookSheet book, onClose, onPrev?, onNext? />` — paper sheet overlay: cover left (stacked above on mobile), right: status label (default "Finished read"), title, author (if any), blurb (if any), review (if any), rating, Previous / Next (within the shelf). Esc closes, ←/→ navigate, focus trapped and returned.

- [ ] **Step 1:** Implement; absent fields render nothing (Review Focus).
- [ ] **Step 2:** Test with the longest title and a book with no data.

### Task 8: Route, nav, sitemap, a11y, verification

**Files:** Create `app/library/page.tsx`, `components/ShelfList.tsx`; modify `components/Navbar.tsx`, `app/sitemap.ts`.

- [ ] **Step 1:** `page.tsx` with `pageMetadata({ title: "Library", description, path: "/library" })`, fixed full-viewport wrapper, "back" link, `<LibraryScene/>`, `<ShelfList/>`.
- [ ] **Step 2:** Add `library` to Navbar items and `/library` to sitemap static routes.
- [ ] **Step 3:** `npx tsc --noEmit`, `npm run lint`, `npm run build` all pass.
- [ ] **Step 4:** Browser check at 1440 and 390 widths: load animation, zoom, open book (with and without data), prev/next, Esc. Fix and repeat until it reads as pencil-sketched.
