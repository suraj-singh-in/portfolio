import type { Vec2 } from '../core/types'
import { makeTrack, type TrackHit } from './track'

/**
 * The east road: leaves the clearing to the right, winds east through the forest, turns left (north),
 * then makes one final right turn (east) into the town wall, which stands side-on across the way.
 */
const CONTROL: readonly Vec2[] = [
  { x: 8, z: -1 }, { x: 18, z: -1.5 }, { x: 34, z: 1.2 }, { x: 50, z: -1.5 }, { x: 64, z: 0.5 },
  { x: 74, z: -3 }, { x: 80, z: -10 }, { x: 83, z: -17 }, { x: 88, z: -21.5 }, { x: 94, z: -22.4 }, { x: 99.8, z: -22.3 },   // ends a horse-length short of the wall
]
/** walkable half-width (m) at arc length s; gently uneven like a worn forest track */
export const ROAD = makeTrack(CONTROL, (s) => 2.6 + 0.35 * Math.sin(s * 0.21) + 0.2 * Math.sin(s * 0.53 + 1))
export type RoadHit = TrackHit
export const roadQuery = (p: Vec2): RoadHit => ROAD.query(p)

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
// it runs level with the town wall's north tower and stops at the tower's side, so the tower stands in front of the joint
const NORTH_TOWER = { x: WALL.x - Math.sin(WALL.tilt) * WALL.half, z: WALL.z - Math.cos(WALL.tilt) * WALL.half }
const STONE_SEG = 10.9, STONE_X1 = NORTH_TOWER.x - 0.6   // tucked under the tower so the two read as one wall
/** the diagonal town wall is one sprite: sort it by its far (north) tower so anyone on the road draws in front */
export const WALL_DEPTH_AT: Vec2 = NORTH_TOWER
export const STONE_WALL = { z: NORTH_TOWER.z, x0: STONE_X1 - 3 * STONE_SEG, x1: STONE_X1, segment: STONE_SEG } as const
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

/** "This town doesn't allow forest folks yet." — once per arrival at the wall. */
export function createWallCaption(near = 5, reset = 9) {
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
