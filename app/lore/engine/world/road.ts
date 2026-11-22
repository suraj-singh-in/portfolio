import { CONFIG } from '../config'
import type { Vec2 } from '../core/types'
import { clampToClearing, edgeRadius } from './clearing'

/**
 * The east road: leaves the clearing to the right, winds east through the forest, then turns
 * north (up the screen) for the last stretch so the town wall at its end faces the camera.
 */
const CONTROL: readonly Vec2[] = [
  { x: 8, z: -1 }, { x: 18, z: -1.5 }, { x: 34, z: 1.2 }, { x: 50, z: -1.5 }, { x: 66, z: 0.8 },
  { x: 80, z: -2 }, { x: 89, z: -8.5 }, { x: 92.5, z: -17 }, { x: 93, z: -25 },
]
const STEP = 1   // metres between resampled centreline points

function catmull(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number): Vec2 {
  const t2 = t * t, t3 = t2 * t
  const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
  return { x: f(p0.x, p1.x, p2.x, p3.x), z: f(p0.z, p1.z, p2.z, p3.z) }
}

function buildCentreline(): Vec2[] {
  const fine: Vec2[] = []
  for (let i = 0; i < CONTROL.length - 1; i++) {
    const p0 = CONTROL[Math.max(0, i - 1)], p1 = CONTROL[i], p2 = CONTROL[i + 1], p3 = CONTROL[Math.min(CONTROL.length - 1, i + 2)]
    for (let k = 0; k < 40; k++) fine.push(catmull(p0, p1, p2, p3, k / 40))
  }
  fine.push(CONTROL[CONTROL.length - 1])
  // resample at an even STEP along the curve
  const out: Vec2[] = [fine[0]]
  let carry = 0
  for (let i = 1; i < fine.length; i++) {
    const a = fine[i - 1], b = fine[i], seg = Math.hypot(b.x - a.x, b.z - a.z)
    let along = STEP - carry
    while (along <= seg) { const k = along / seg; out.push({ x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k }); along += STEP }
    carry = seg - (along - STEP)
  }
  const last = fine[fine.length - 1], tail = out[out.length - 1]
  if (Math.hypot(last.x - tail.x, last.z - tail.z) > 0.25) out.push(last)
  return out
}

const points = buildCentreline()

export const ROAD = {
  points,
  step: STEP,
  length: (points.length - 1) * STEP,
  /** walkable half-width (m) at arc length s; gently uneven like a worn forest track */
  halfWidth: (s: number) => 2.6 + 0.35 * Math.sin(s * 0.21) + 0.2 * Math.sin(s * 0.53 + 1),
} as const

/** The town wall closing the road: centre of its footing, and half its span along x. */
export const WALL = { x: 93, z: -26.8, half: 7.2 } as const

export type RoadHit = { d: number; s: number; at: Vec2; normal: Vec2 }

/** Nearest point on the road centreline: distance d, arc length s, the point and the left-hand normal there. */
export function roadQuery(p: Vec2): RoadHit {
  let best: RoadHit = { d: Infinity, s: 0, at: points[0], normal: { x: 0, z: 1 } }
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1]
    const ex = b.x - a.x, ez = b.z - a.z, len2 = ex * ex + ez * ez
    const k = Math.max(0, Math.min(1, ((p.x - a.x) * ex + (p.z - a.z) * ez) / len2))
    const at = { x: a.x + ex * k, z: a.z + ez * k }, d = Math.hypot(p.x - at.x, p.z - at.z)
    if (d < best.d) { const l = Math.sqrt(len2); best = { d, s: (i + k) * STEP, at, normal: { x: -ez / l, z: ex / l } } }
  }
  return best
}

export const inClearing = (p: Vec2) => {
  const sx = p.x / CONFIG.CLEARING.stretchX
  return Math.hypot(sx, p.z) <= edgeRadius(Math.atan2(p.z, sx))
}

/** The walkable world is the clearing plus the road; anything outside is pulled to the nearer of the two edges. */
export function clampToWorld(p: Vec2): Vec2 {
  if (inClearing(p)) return p
  const q = roadQuery(p), hw = ROAD.halfWidth(q.s)
  if (q.d <= hw) return p
  const onRoad = { x: q.at.x + ((p.x - q.at.x) * hw) / q.d, z: q.at.z + ((p.z - q.at.z) * hw) / q.d }
  const onClearing = clampToClearing(p)
  const dr = Math.hypot(p.x - onRoad.x, p.z - onRoad.z), dc = Math.hypot(p.x - onClearing.x, p.z - onClearing.z)
  return dr < dc ? onRoad : onClearing
}

/** "This town doesn't allow forest folks yet." — once per arrival at the wall. */
export function createWallCaption(near = 3.5, reset = 7) {
  let shown = false
  return {
    update(p: Vec2): boolean {
      const ahead = Math.abs(p.x - WALL.x) < WALL.half + 1.5
      const d = Math.abs(p.z - WALL.z)
      if (shown && (!ahead || d > reset)) shown = false
      if (!shown && ahead && d < near) { shown = true; return true }
      return false
    },
  }
}
