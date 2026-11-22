import { CONFIG } from '../config'
import { fbm, valueNoise } from '../core/rng'
import { LAYOUT, edgeRadius } from '../world/clearing'
import type { World } from '../world/scatter'
import { NORTH, inLake, inMeadow } from '../world/north'
import { inClearing } from '../world/bounds'

/** Ground the field map covers (world metres; clearing, east road, north track and lake) at 6 cells per metre — finer than any grass pattern. */
export const FIELD = { minX: -32, minZ: -125, sx: 144, sz: 153, w: 864, h: 918 } as const
/** The blades live in a window this size that follows the camera; each blade stays pinned to the world. */
export const GRASS_WINDOW = { sx: 64, sz: 56 } as const

export type GrassField = {
  /**
   * RGBA8 per cell. R: density 0..1 (0 = blocked: hut, fire, rock cores).
   * G: height factor 0..1. B: region bits (128 = wildflower patch, 64 = dry straw patch).
   * A: tall-wisp probability threshold 0..1.
   */
  data: Uint8Array<ArrayBuffer>
  /** average chance a candidate blade survives the density test (sizes the instance count) */
  meanAcceptance: number
}

/** Bake the meadow's density, height and grass-type regions once (same noise as the prototype). */
export function buildGrassField(world: World): GrassField {
  const job = fieldJob(world)
  for (let j = 0; j < FIELD.h; j++) job.row(j)
  return job.result()
}

/** Same as buildGrassField, but yields to the browser every few rows so the loading screen keeps animating. */
export async function buildGrassFieldAsync(world: World, yieldFn: () => Promise<void>, rowsPerChunk = 16): Promise<GrassField> {
  const job = fieldJob(world)
  for (let j = 0; j < FIELD.h; j++) {
    job.row(j)
    if ((j + 1) % rowsPerChunk === 0) await yieldFn()
  }
  return job.result()
}

export type FieldBuild = {
  /** the field being filled in place (its texture can be shown while rows are still missing) */
  field: GrassField
  /** how many rows (in build order) lie within z0..z1 — the loading screen builds those first */
  rowsWithin(z0: number, z1: number): number
  /** build up to n more rows, nearest the spawn first; returns how many were built */
  stepRows(n: number): number
  readonly done: boolean
  /** 0..1 */
  readonly progress: number
}

/**
 * Build the field nearest-the-spawn first so loading only pays for the area around the player;
 * the rest fills in afterwards in small steps. Ends byte-for-byte equal to buildGrassField.
 */
export function startGrassField(world: World): FieldBuild {
  const job = fieldJob(world)
  const zOf = (j: number) => FIELD.minZ + ((j + 0.5) / FIELD.h) * FIELD.sz
  const order = Array.from({ length: FIELD.h }, (_, j) => j).sort((a, b) => Math.abs(zOf(a)) - Math.abs(zOf(b)))
  let next = 0
  const field: GrassField = { data: job.data, meanAcceptance: 0 }
  return {
    field,
    rowsWithin: (z0, z1) => order.filter((j) => zOf(j) >= z0 && zOf(j) <= z1).length,
    stepRows(n) {
      const end = Math.min(FIELD.h, next + n), built = end - next
      for (; next < end; next++) job.row(order[next])
      // acceptance of what exists so far sizes the blade count; the spawn area is representative
      if (built) field.meanAcceptance = job.acceptance(next)
      return built
    },
    get done() { return next >= FIELD.h },
    get progress() { return next / FIELD.h },
  }
}

function fieldJob(world: World) {
  const { w, h } = FIELD
  const data = new Uint8Array(w * h * 4)
  const sx = CONFIG.CLEARING.stretchX
  const props = [
    ...world.rocks.filter((r) => r.scale >= 0.4).map((r) => ({ x: r.x, z: r.z, r: 0.55 * r.scale })),   // pebbles are too small to bare the ground
    { ...LAYOUT.log, r: 0.9 }, { ...LAYOUT.gnarled, r: 0.9 },
  ]
  // rock cores bucketed by 2 m cell so each field cell checks only its neighbours
  const buckets = new Map<number, { x: number; z: number; r: number }[]>()
  const bkey = (i: number, j: number) => (i + 4096) * 8192 + (j + 4096)
  for (const p of props) { const k = bkey(Math.floor(p.x / 2), Math.floor(p.z / 2)); const l = buckets.get(k); if (l) l.push(p); else buckets.set(k, [p]) }
  const onRock = (x: number, z: number) => {
    const ci = Math.floor(x / 2), cj = Math.floor(z / 2)
    for (let a = ci - 1; a <= ci + 1; a++) for (let b = cj - 1; b <= cj + 1; b++) {
      const l = buckets.get(bkey(a, b)); if (l) for (const p of l) if (Math.hypot(x - p.x, z - p.z) < p.r * 0.45) return true
    }
    return false
  }
  const hut = LAYOUT.hut, fire = LAYOUT.fire
  /** 0 at the foot of the north track → 1 up at the pass: grass thins, shortens and dries with height */
  const altitude = (x: number, z: number) => {
    if (Math.abs(x) > 45 || z > -10) return 0
    const k = Math.min(1, (-10 - z) / 52); return k * k * (3 - 2 * k)
  }
  let acc = 0

  const row = (j: number) => { for (let i = 0; i < w; i++) {
    const x = FIELD.minX + ((i + 0.5) / w) * FIELD.sx, z = FIELD.minZ + ((j + 0.5) / h) * FIELD.sz
    const o = (j * w + i) * 4
    const blocked = (Math.abs(x - hut.x) < 2.3 && Math.abs(z - hut.z) < 2.0) || Math.hypot(x - fire.x, z - fire.z) < 0.95
      || onRock(x, z) || inLake({ x, z })   // no grass in the water, nor anywhere beyond it
    const big = fbm(x * 0.09 + 7, z * 0.09 - 3), mid = fbm(x * 0.32, z * 0.32), small = valueNoise(x * 1.3 + 4, z * 1.3 + 8)
    let d = 0.5 + big * 0.4 + (mid - 0.5) * 0.6 + (small - 0.5) * 0.25
    if (mid < 0.24) d *= 0.12                                             // small bare patches
    const worn = Math.max(0, 1 - Math.hypot(x - fire.x, z - fire.z) / 3.2) + Math.max(0, 1 - Math.hypot(x - (hut.x + 0.5), z - (hut.z + 2.6)) / 2.2)
    d = blocked ? 0 : Math.max(0, Math.min(1, d - worn * 0.55))
    // the lakeside meadow: thick, knee-high grass right down to the water (sheltered, so no altitude thinning)
    const meadow = !blocked && inMeadow({ x, z }, 1.12)
    // the climb: a grassy lane between bare, stony shoulders; the lane's grass grows longer the higher it goes
    let lane = -1, shoulder = false
    if (!meadow && !blocked && x > -20 && x < 22 && z < -6 && z > -92 && !inClearing({ x, z })) {
      const q = NORTH.query({ x, z }), hw = NORTH.halfWidth(q.s)
      if (q.d <= hw + 0.3) lane = q.s / NORTH.length
      else if (q.d < hw + 3.5) shoulder = true
    }
    const alt = meadow || lane >= 0 ? 0 : altitude(x, z)
    d *= 1 - 0.65 * alt
    if (meadow) d = Math.max(d, 0.7 + big * 0.25)
    if (lane >= 0) d = Math.max(d, 0.62 + big * 0.25)
    if (shoulder) d *= 0.3
    const edge = Math.hypot(x / sx, z) / edgeRadius(Math.atan2(z, x / sx))
    const flower = alt < 0.3 && fbm(x * 0.5 + 20, z * 0.5 - 13) > 0.66
    const dry = fbm(x * 0.11 + 50, z * 0.11 + 31) > 0.6 - alt * 0.45     // the higher, the more straw
    const tall = meadow ? 0.85 + small * 0.15 : lane >= 0 ? 0.15 + 0.6 * lane : Math.min(1, 0.1 + Math.max(0, edge - 0.6) * 0.9 + (fbm(x * 0.25 + 90, z * 0.25) > 0.62 ? 0.35 : 0)) * (1 - 0.7 * alt)
    data[o] = Math.round(d * 255)
    data[o + 1] = Math.round((meadow ? Math.max(mid, 0.92) : lane >= 0 ? 0.35 + 0.5 * lane : mid * (1 - 0.5 * alt)) * 255)
    data[o + 2] = (flower ? 128 : 0) + (dry ? 64 : 0)
    data[o + 3] = Math.round(tall * 255)
    acc += Math.min(1, Math.pow(d, 1.4) * 1.15)
  } }
  return { row, data, acceptance: (rows: number) => acc / (w * Math.max(1, rows)), result: (): GrassField => ({ data, meanAcceptance: acc / (w * h) }) }
}
