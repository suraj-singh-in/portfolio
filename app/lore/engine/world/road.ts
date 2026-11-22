import { CONFIG } from '../config'
import type { Vec2 } from '../core/types'
import { clampToClearing, edgeRadius } from './clearing'

/**
 * The east road: leaves the clearing to the right, winds east through the forest, turns left (north),
 * then makes one final right turn (east) into the town wall, which stands side-on across the way.
 */
const CONTROL: readonly Vec2[] = [
  { x: 8, z: -1 }, { x: 18, z: -1.5 }, { x: 34, z: 1.2 }, { x: 50, z: -1.5 }, { x: 64, z: 0.5 },
  { x: 74, z: -3 }, { x: 80, z: -10 }, { x: 83, z: -17 }, { x: 88, z: -21.5 }, { x: 96, z: -22.4 }, { x: 104, z: -22.3 },
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

/**
 * The town wall closing the road: side-on across the way, turned `tilt` rad toward the camera (north end
 * west) so its gate face shows. Centre of its footing, half its span along its length, its thickness (m).
 * Must match the yaw it is baked with (bake yaw 90° + tilt).
 */
export const WALL = { x: 106.5, z: -22.3, half: 7.2, tilt: (25 * Math.PI) / 180, depth: 2.3 } as const
/** x of the wall's centre line at a given z. */
export const wallXAt = (z: number) => WALL.x + (z - WALL.z) * Math.tan(WALL.tilt)
/** Points along the wall's centre line, `step` apart. */
export function wallLine(step: number): Vec2[] {
  const out: Vec2[] = [], ux = -Math.sin(WALL.tilt), uz = -Math.cos(WALL.tilt)
  for (let t = -WALL.half; t <= WALL.half + 1e-6; t += step) out.push({ x: WALL.x + ux * t, z: WALL.z + uz * t })
  return out
}
/** A long stone wall north of the last turn, closing the way the road used to go on: three segments along x, meeting the town wall. */
const STONE_Z = -27, STONE_SEG = 10.9
export const STONE_WALL = { z: STONE_Z, x0: wallXAt(STONE_Z) - 3 * STONE_SEG, x1: wallXAt(STONE_Z), segment: STONE_SEG } as const
export const STONE_WALL_SEGMENTS: readonly Vec2[] = [0, 1, 2].map((i) => ({ x: STONE_WALL.x0 + STONE_WALL.segment * (i + 0.5), z: STONE_WALL.z }))
/** Paved path continuing east behind the gate — scenery only, never walkable. Tiles butt up to the wall's back face. */
export const GATE_TILE = { half: 3.43 } as const
const back = wallXAt(WALL.z) + WALL.depth / 2
export const GATE_PATH: readonly Vec2[] = [0, 1, 2].map((i) => ({ x: back + GATE_TILE.half - 0.3 + i * (GATE_TILE.half * 2 - 0.1), z: WALL.z }))
/** A few townsfolk on the far side of the wall (scenery). */
export const PEOPLE: readonly (Vec2 & { sprite: string })[] = [
  { sprite: 'person_a', x: back + 4.5, z: WALL.z - 3.2 },
  { sprite: 'person_b', x: back + 9.5, z: WALL.z + 2.8 },
  { sprite: 'person_c', x: back + 13, z: WALL.z - 1.6 },
]

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
      // distance across / along the turned wall
      const dx = p.x - WALL.x, dz = p.z - WALL.z, c = Math.cos(WALL.tilt), s = Math.sin(WALL.tilt)
      const ahead = Math.abs(-dx * s - dz * c) < WALL.half + 1.5
      const d = Math.abs(dx * c - dz * s)
      if (shown && (!ahead || d > reset)) shown = false
      if (!shown && ahead && d < near) { shown = true; return true }
      return false
    },
  }
}
