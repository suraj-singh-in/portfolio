# notasecondhandlife.com

Personal site of Suraj Singh — software engineer based in Delhi.

Writing on Indian history, philosophy, and software engineering. Live at [notasecondhandlife.com](https://notasecondhandlife.com).

Built with Next.js 16 (App Router), Tailwind CSS, TypeScript, deployed on Vercel.

---

## Project Structure

```
app/
  page.tsx                        # Homepage
  about/                          # About page (Krishnamurti / second-hand life)
  experience/                     # Work experience
  projects/                       # Side projects
  blogs/
    page.tsx                      # Blog listing (all categories)
    constants/
      blogs-data.service.ts       # Single source of truth for all blog data
    computer-science/             # Category + posts
    indian-history/               # Category + posts (India and its History series)
    india-and-its-poets/          # Category + posts
    philosophy/                   # Category + posts (The Uncomfortable Philosophers series)
  compass/                        # CS learning notes (DSA, recursion)
  manhattan-project/              # Reading list

components/
  Navbar.tsx
  Footer.tsx
  PageShell.tsx
  BlogSearch.tsx
  ListingComponent.tsx            # IList / ISection types used across blog pages
  HomeContent.tsx

lib/
  metadata.ts                     # pageMetadata() and articleMetadata() helpers

public/
  Suraj_Singh_Resume.pdf
```

## Key Conventions

**Adding a blog post**

1. Add entry to `app/blogs/constants/blogs-data.service.ts` with `title`, `url`, `description`, `date`, and optionally `episode`
2. Create `app/blogs/[category]/[slug]/page.tsx` using `articleMetadata()` from `lib/metadata`
3. Add the URL to `app/sitemap.ts`

**Metadata**

All pages use helpers from `lib/metadata.ts`:
- `pageMetadata({ title, description, path })` — for listing/category pages
- `articleMetadata({ title, description, path, keywords?, ogImageAlt? })` — for blog posts

Both auto-fill `og:site_name`, `twitter:card: summary_large_image`, `twitter:creator`, and the OG image.

**Blog data**

`app/blogs/constants/blogs-data.service.ts` exports:
- `blogsData` — the full `IList` object
- `getBlogsData()` — used by the blog listing page
- `getBlogsDataByCategory(title)` — used by each category page

## Dev

```bash
npm run dev      # localhost:3000
npm run build    # production build (also runs as pre-commit hook)
```

Pre-commit hook runs `npm run build` via Husky — commits are blocked if the build fails.
