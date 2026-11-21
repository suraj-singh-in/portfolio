export type Rand = () => number

export function mulberry32(seed: number): Rand {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const r2 = (n: number) => Math.round(n * 100) / 100

/** One slightly bowed pencil stroke from (x1,y1) to (x2,y2), with end jitter and overshoot. */
export function wobbleLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rand: Rand,
  amp = 1.4,
  overshoot = 3,
): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const nx = -uy
  const ny = ux
  const j = () => (rand() - 0.5) * amp
  const sx = x1 - ux * rand() * overshoot + j()
  const sy = y1 - uy * rand() * overshoot + j()
  const ex = x2 + ux * rand() * overshoot + j()
  const ey = y2 + uy * rand() * overshoot + j()
  const bow = (rand() - 0.5) * amp * 2.2
  const cx = (sx + ex) / 2 + nx * bow
  const cy = (sy + ey) / 2 + ny * bow
  return `M${r2(sx)} ${r2(sy)} Q${r2(cx)} ${r2(cy)} ${r2(ex)} ${r2(ey)}`
}

/** A hand-drawn rectangle: four independent strokes whose corners overshoot. Drawn twice for a pencil double-stroke. */
export function sketchRect(
  x: number,
  y: number,
  w: number,
  h: number,
  rand: Rand,
  amp = 1.4,
  passes = 2,
): string {
  const parts: string[] = []
  for (let p = 0; p < passes; p++) {
    parts.push(
      wobbleLine(x, y, x + w, y, rand, amp),
      wobbleLine(x + w, y, x + w, y + h, rand, amp),
      wobbleLine(x + w, y + h, x, y + h, rand, amp),
      wobbleLine(x, y + h, x, y, rand, amp),
    )
  }
  return parts.join(" ")
}

/** Diagonal hatching clipped to a rectangle: short parallel strokes. */
export function hatch(
  x: number,
  y: number,
  w: number,
  h: number,
  gap: number,
  rand: Rand,
): string {
  const parts: string[] = []
  for (let d = -h; d < w; d += gap) {
    const x1 = Math.max(x, x + d)
    const y1 = d < 0 ? y - d : y
    const x2 = Math.min(x + w, x + d + h)
    const y2 = d + h > w ? y + (w - d) : y + h
    if (x2 > x1) parts.push(wobbleLine(x1, y1, x2, y2, rand, 0.8, 0))
  }
  return parts.join(" ")
}
