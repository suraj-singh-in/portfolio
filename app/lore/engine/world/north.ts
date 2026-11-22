import type { Vec2 } from '../core/types'
import { makeTrack } from './track'

/**
 * The north mountain track: wide, uneven foothills out of the clearing, then a long climb of five legs —
 * two full S-turns — on a grassy lane between boulder shoulders, a narrower pass, and a long meadow on a
 * cold lake with row after row of mountains standing in the water. The ground stays flat: height is
 * suggested by the zig-zag, the rock and the grass changing as you climb.
 */
const CONTROL: readonly Vec2[] = [
  { x: 1, z: -9 }, { x: 3, z: -18 }, { x: -2, z: -26 }, { x: 2, z: -34 },                     // foothills
  { x: 14, z: -40.5 }, { x: -11, z: -48 }, { x: 13, z: -55.5 }, { x: -10, z: -63 }, { x: 12, z: -70.5 },   // two S-turns
  { x: 5, z: -76 }, { x: 1, z: -80.5 },                                                       // the pass
]

/** arc lengths where the foothills end and the pass begins (filled once the centre line exists) */
const marks = { foot: 0, pass: 0 }
const smooth = (a: number, b: number, s: number) => { const k = Math.min(1, Math.max(0, (s - a) / (b - a))); return k * k * (3 - 2 * k) }
const widthAt = (s: number) => {
  const foothills = 4.3 + 0.8 * Math.sin(s * 0.35) + 0.4 * Math.sin(s * 0.9 + 2)   // broad and uneven
  const climb = 2.45 + 0.15 * Math.sin(s * 0.5)                                    // a comfortable lane
  const w = foothills + (climb - foothills) * smooth(marks.foot - 4, marks.foot + 2, s)
  return w + (2.05 - w) * smooth(marks.pass - 3, marks.pass + 1, s)
}
export const NORTH = makeTrack(CONTROL, widthAt)
marks.foot = NORTH.points.findIndex((p) => p.z < -33) * NORTH.step
marks.pass = NORTH.points.findIndex((p) => p.z < -71) * NORTH.step

export type Ellipse = { x: number; z: number; rx: number; rz: number }
export const inEllipse = (p: Vec2, e: Ellipse) => ((p.x - e.x) / e.rx) ** 2 + ((p.z - e.z) / e.rz) ** 2 <= 1
/** nearest point on an ellipse's edge (radial approximation — fine for these gentle shapes) */
export const toEllipseEdge = (p: Vec2, e: Ellipse): Vec2 => {
  const ux = (p.x - e.x) / e.rx, uz = (p.z - e.z) / e.rz, l = Math.hypot(ux, uz) || 1
  return { x: e.x + (ux / l) * e.rx, z: e.z + (uz / l) * e.rz }
}

/**
 * The lake: from an uneven waterline it runs on past the first peaks and between them, out of sight —
 * wider than any view, so the horizon is only water and mountains. Its shoreline curves toward you
 * beyond the meadow's ends. `shoreZ` is also written into the water shader (render/water.ts).
 */
export const LAKE = { shore: -87.3, farZ: -109, half: 60, bay: [24, 38, 1.6] as const } as const
/** z of the waterline at x: the lake is everything north of it (smaller z) */
export const shoreZ = (x: number) => LAKE.shore + 0.25 * Math.sin(x * 0.35) + 0.15 * Math.sin(x * 0.9 + 1) + LAKE.bay[2] * smooth(LAKE.bay[0], LAKE.bay[1], Math.abs(x))
/** in the water, or anywhere beyond it */
export const inLake = (p: Vec2, pad = 0) => p.z < shoreZ(p.x) + pad && Math.abs(p.x) < LAKE.half + 40

/**
 * The lakeside meadow where the pass comes out: long, wide open ground with long grass. Its outline is an
 * uneven blob (never an oval); the water cuts its north side, so the waterline is its far edge.
 */
export const SHORE: Ellipse = { x: 0, z: -83, rx: 22, rz: 8 }
/** the meadow's edge as a multiple of SHORE's radii, by angle */
export const meadowRadius = (a: number) => 1 + 0.14 * Math.sin(3 * a + 0.7) + 0.09 * Math.sin(5 * a + 2.1) + 0.06 * Math.sin(8 * a + 0.3)
const meadowR = (p: Vec2, grow = 1) => {
  const ux = (p.x - SHORE.x) / SHORE.rx, uz = (p.z - SHORE.z) / SHORE.rz
  return Math.hypot(ux, uz) / (meadowRadius(Math.atan2(uz, ux)) * grow)
}
/** on the meadow (dry land only); `grow` scales its outline (the long grass reaches a little past it) */
export const inMeadow = (p: Vec2, grow = 1) => meadowR(p, grow) <= 1 && !inLake(p)
/** the meadow's outline, sampled once (a radial projection would slide you along this wide, shallow shape) */
const MEADOW_EDGE: readonly Vec2[] = Array.from({ length: 180 }, (_, i) => {
  const a = (i / 180) * Math.PI * 2, k = meadowRadius(a) * 0.999
  return { x: SHORE.x + Math.cos(a) * k * SHORE.rx, z: SHORE.z + Math.sin(a) * k * SHORE.rz }
})
/** nearest meadow point for a point outside it */
export function toMeadowEdge(p: Vec2): Vec2 {
  // stepped into the water from the meadow: straight back to the waterline, never sideways
  if (meadowR(p, 1.25) <= 1 && inLake(p) && inMeadow({ x: p.x, z: shoreZ(p.x) + 0.05 })) return { x: p.x, z: shoreZ(p.x) + 0.05 }
  let best = MEADOW_EDGE[0], bd = Infinity
  for (const q of MEADOW_EDGE) { const d = (q.x - p.x) ** 2 + (q.z - p.z) ** 2; if (d < bd && !inLake(q)) { bd = d; best = q } }
  return best
}

/**
 * Mountains standing in the water, row behind row, each row taller than the one before so the peaks keep
 * rising out of reach. Skyline sprites (baked from a low angle so the peaks read). Row 0 is mirrored in the lake.
 */
const row = (r: number, z: number, xs: number[], scales: number[]) =>
  xs.map((x, i) => ({ sprite: ['skyline_c', 'skyline_a', 'skyline_b'][(i + r) % 3], x, z: z - ((i * 7) % 3) * 0.6, scale: scales[i % scales.length], row: r }))
export const MOUNTAINS: readonly (Vec2 & { sprite: string; scale: number; row: number })[] = [
  ...row(0, -96, [-46, -33, -20, -7, 5, 18, 31, 45], [0.74, 0.62, 0.7, 0.68, 0.78]),
  ...row(1, -104.5, [-52, -36, -18, -2, 14, 30, 47], [0.92, 1.0, 0.88, 0.96]),
  ...row(2, -113, [-50, -26, -2, 22, 46], [1.15, 1.25, 1.2]),
]

/** "The water is too cold to cross. The mountains wait." — once per arrival at the water. */
export function createLakeCaption() {
  let shown = false
  return {
    update(p: Vec2): boolean {
      if (shown && p.z > shoreZ(p.x) + 8) shown = false   // re-arms once you have walked away from the water
      if (!shown && inMeadow(p) && p.z < shoreZ(p.x) + 1.2) { shown = true; return true }
      return false
    },
  }
}

/** How far (m) the camera leans north past you: none on the climb, easing to the full view at the shore. */
export function lookAhead(p: Vec2): number {
  if (Math.abs(p.x - SHORE.x) > SHORE.rx + 6) return 0
  return 7 * smooth(-71, -85.5, p.z)
}
