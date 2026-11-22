import type { Vec2 } from '../core/types'
import { makeTrack } from './track'

/**
 * The north mountain track: wide, uneven foothills out of the clearing, three switchbacks climbing
 * between cliffs, a tight pass, then a small shore on a cold lake with mountains rising right behind it.
 * The ground stays flat: height is suggested by the zig-zag, the rock walls and the thinning green.
 */
const CONTROL: readonly Vec2[] = [
  { x: 1, z: -9 }, { x: 3, z: -18 }, { x: -2, z: -26 }, { x: 2, z: -34 },        // foothills
  { x: 11, z: -40 }, { x: -8, z: -47 }, { x: 10, z: -54 }, { x: 1, z: -61 },     // switchbacks
  { x: 0.5, z: -67 }, { x: 0, z: -72 },                                          // the pass
]

/** arc lengths where the foothills end and the pass begins (filled once the centre line exists) */
const marks = { foot: 0, pass: 0 }
const smooth = (a: number, b: number, s: number) => { const k = Math.min(1, Math.max(0, (s - a) / (b - a))); return k * k * (3 - 2 * k) }
const widthAt = (s: number) => {
  const foothills = 4.3 + 0.8 * Math.sin(s * 0.35) + 0.4 * Math.sin(s * 0.9 + 2)   // broad and uneven
  const climb = 1.9 + 0.15 * Math.sin(s * 0.5)
  const w = foothills + (climb - foothills) * smooth(marks.foot - 4, marks.foot + 2, s)
  return w + (1.6 - w) * smooth(marks.pass - 3, marks.pass + 1, s)
}
export const NORTH = makeTrack(CONTROL, widthAt)
marks.foot = NORTH.points.findIndex((p) => p.z < -33) * NORTH.step
marks.pass = NORTH.points.findIndex((p) => p.z < -60.5) * NORTH.step

export type Ellipse = { x: number; z: number; rx: number; rz: number }
export const inEllipse = (p: Vec2, e: Ellipse) => ((p.x - e.x) / e.rx) ** 2 + ((p.z - e.z) / e.rz) ** 2 <= 1
/** nearest point on an ellipse's edge (radial approximation — fine for these gentle shapes) */
export const toEllipseEdge = (p: Vec2, e: Ellipse): Vec2 => {
  const ux = (p.x - e.x) / e.rx, uz = (p.z - e.z) / e.rz, l = Math.hypot(ux, uz) || 1
  return { x: e.x + (ux / l) * e.rx, z: e.z + (uz / l) * e.rz }
}

/** the lakeside meadow where the pass comes out: wide open ground, long grass; its north edge is the waterline */
export const SHORE: Ellipse = { x: 0, z: -73, rx: 16, rz: 5 }
/**
 * The lake: from an uneven waterline it runs on past the first peaks and between them, out of sight —
 * wider than any view, so the horizon is only water and mountains. Its shoreline curves toward you
 * beyond the meadow's ends. `shoreZ` is also written into the water shader (render/water.ts).
 */
export const LAKE = { shore: -78.3, farZ: -100, half: 60, bay: [17, 30, 1.6] as const } as const
const smoothstep = (a: number, b: number, v: number) => { const k = Math.min(1, Math.max(0, (v - a) / (b - a))); return k * k * (3 - 2 * k) }
/** z of the waterline at x: the lake is everything north of it (smaller z) */
export const shoreZ = (x: number) => LAKE.shore + 0.25 * Math.sin(x * 0.35) + 0.15 * Math.sin(x * 0.9 + 1) + LAKE.bay[2] * smoothstep(LAKE.bay[0], LAKE.bay[1], Math.abs(x))
/** in the water, or anywhere beyond it */
export const inLake = (p: Vec2, pad = 0) => p.z < shoreZ(p.x) + pad && Math.abs(p.x) < LAKE.half + 40
/**
 * Mountains standing in the water, row behind row, each row taller than the one before so the peaks keep
 * rising out of reach. Skyline sprites (baked from a low angle so the peaks read). Row 0 is mirrored in the lake.
 */
const row = (r: number, z: number, xs: number[], scales: number[]) =>
  xs.map((x, i) => ({ sprite: ['skyline_c', 'skyline_a', 'skyline_b'][(i + r) % 3], x, z: z - ((i * 7) % 3) * 0.6, scale: scales[i % scales.length], row: r }))
export const MOUNTAINS: readonly (Vec2 & { sprite: string; scale: number; row: number })[] = [
  ...row(0, -87, [-46, -33, -20, -7, 5, 18, 31, 45], [0.74, 0.62, 0.7, 0.68, 0.78]),
  ...row(1, -95.5, [-52, -36, -18, -2, 14, 30, 47], [0.92, 1.0, 0.88, 0.96]),
  ...row(2, -104, [-50, -26, -2, 22, 46], [1.15, 1.25, 1.2]),
]

/** "The water is too cold to cross. The mountains wait." — once per arrival at the water. */
export function createLakeCaption() {
  let shown = false
  const waterline = SHORE.z - SHORE.rz
  return {
    update(p: Vec2): boolean {
      if (shown && p.z > SHORE.z + SHORE.rz + 2) shown = false
      if (!shown && inEllipse(p, SHORE) && p.z < waterline + 1.2) { shown = true; return true }
      return false
    },
  }
}

/** How far (m) the camera leans north past you: none on the climb, easing to the full view at the shore. */
export function lookAhead(p: Vec2): number {
  if (Math.abs(p.x - SHORE.x) > SHORE.rx + 6) return 0
  return 7 * smooth(-62, -76.5, p.z)
}
