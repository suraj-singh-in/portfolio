# Design Aesthetic — Portfolio

## Philosophy
**Minimalist, typographic, content-first.** No decorative noise. Every element earns its space. The site feels like a well-formatted technical document — clean whitespace, subtle hierarchy, restrained color. Influences: Linear, Vercel, Rauno Friberg-style minimal portfolios.

---

## Color Palette

| Role | Light Mode | Dark Mode |
|------|-----------|-----------|
| Background | `#ffffff` | `#0a0a0a` / `#111010` |
| Foreground (text) | `#171717` | `#ededed` |
| Muted text | `neutral-500` | `neutral-400` |
| Body text | `neutral-700` | `neutral-300` |
| Borders | `neutral-100` | `neutral-800` |
| Card hover bg | `neutral-50` | `neutral-900` |
| Selection bg | `#e5e5e5` | `#333333` |
| Code bg | `#0d1117` (always dark) | same |

No brand accent color — the site is entirely neutral-scale. Color comes from content (syntax highlighting, icons), not UI chrome.

---

## Typography

- **Font family**: Geist (sans-serif + monospace) — loaded as CSS vars `--font-geist-sans` and `--font-geist-mono`
- **Headings**: `text-2xl font-semibold tracking-tighter`
- **Body**: `leading-relaxed`, `text-neutral-700 dark:text-neutral-300`
- **Meta / labels**: `text-sm text-neutral-500`
- **Code inline**: Monospace, wrapped in `bg-neutral-100 dark:bg-neutral-800` pill
- **Code blocks**: `react-syntax-highlighter` with Prism, `duotoneLight` theme, dark container (`#0d1117`), line numbers enabled

---

## Layout System

- **Max width**: `max-w-2xl` (constrained single-column reading column)
- **Horizontal centering**: `mx-auto`
- **Page padding**: `px-6 py-12` mobile → `md:px-0 md:py-20` desktop
- **Section spacing**: `mb-8`, `my-8`, `my-10`, `mt-20`
- **Grid**: Always single-column (no multi-column grid layouts)
- **Flex**: Used for nav, skill tags, and icon+text pairs

---

## Spacing Tokens (Tailwind)

| Purpose | Classes |
|---------|---------|
| List internal | `pl-5 space-y-2` |
| Card padding | `p-6` |
| Horizontal gaps | `gap-4`, `gap-6` |
| Vertical section gaps | `gap-10`, `space-y-4` |
| Icon gap | `gap-1.5`, `gap-2` |

---

## Components & UI Patterns

### Cards / List Items
- Subtle border: `border border-neutral-100 dark:border-neutral-800`
- Hover background: `hover:bg-neutral-50 dark:hover:bg-neutral-900`
- Rounded: `rounded-lg` or `rounded-md`
- No shadow — shadows are avoided entirely

### Buttons / Links
- Text-only, no filled buttons
- Hover: color shift + opacity change
- External links: `ArrowUpRight` icon (Lucide, 14-16px) appears inline

### Icons
- Source: Lucide React
- Sizes: 14–24px depending on context
- Used for: LinkedIn, GitHub, Mail, MapPin, ArrowUpRight
- Behavior: Revealed on hover via `transition-opacity`, or always visible in nav

### Skill Tags
- Inline flex pills: `text-sm bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full`

### Dividers
- `border-t border-neutral-100 dark:border-neutral-800`
- Used between list sections in `ListingComponent`

### Tables
- `border-collapse`, neutral header text
- Simple, no zebra striping — just borders

---

## Animations

All animations are CSS-based via Tailwind utility classes:

| Trigger | Classes |
|---------|---------|
| Page section entry | `animate-in fade-in slide-in-from-bottom-4 duration-500` |
| Hover interactions | `transition-colors`, `transition-all` |
| Icon reveal on hover | `transition-opacity` |
| Dark mode toggle | Instant (via media query, no JS toggle) |

No JS animation libraries. No scroll-triggered animations. Entry animations are subtle and fast (500ms).

---

## Navigation

- **Desktop**: Horizontal flex, sticky, active link highlighted with `font-medium` + color change
- **Mobile**: Hamburger icon (Lucide `Menu`/`X`) toggles a fullscreen overlay
  - Overlay: `fixed inset-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm`
  - Menu items: Large, centered, padded
- **Active state detection**: Exact pathname match or prefix match (`startsWith`)

---

## Dark Mode

- Triggered by: `@media (prefers-color-scheme: dark)` — no manual toggle
- Theme vars in `globals.css`: `--background`, `--foreground`
- Tailwind `dark:` variants used consistently throughout all components
- Selection highlight adapts: light `#e5e5e5 / black` → dark `#333 / white`

---

## Do's & Don'ts

**Do:**
- Keep layouts single-column, `max-w-2xl`
- Use neutral-scale colors only
- Lean on whitespace for hierarchy
- Keep animations subtle and fast
- Use `text-sm` + muted color for metadata
- Use Lucide icons at 14–16px inline

**Don't:**
- Add colored backgrounds or gradients
- Use shadows or glow effects
- Add decorative illustrations or hero images
- Use font sizes above `text-2xl` for headings
- Add multi-column grids
- Use brand accent colors
- Add loading spinners or complex transitions
