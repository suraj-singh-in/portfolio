import { CONFIG } from '../config'
import { fbm, valueNoise } from '../core/rng'
import { LAYOUT, edgeRadius } from '../world/clearing'
import type { World } from '../world/scatter'

/** Ground area the grass covers (world metres) and the resolution of its field map. */
export const FIELD = { minX: -32, minZ: -28, sx: 64, sz: 56, w: 512, h: 448 } as const

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

function fieldJob(world: World) {
  const { w, h } = FIELD
  const data = new Uint8Array(w * h * 4)
  const sx = CONFIG.CLEARING.stretchX
  const props = [
    ...world.rocks.map((r) => ({ x: r.x, z: r.z, r: 0.55 * r.scale })),
    { ...LAYOUT.log, r: 0.9 }, { ...LAYOUT.gnarled, r: 0.9 },
  ]
  const hut = LAYOUT.hut, fire = LAYOUT.fire
  let acc = 0

  const row = (j: number) => { for (let i = 0; i < w; i++) {
    const x = FIELD.minX + ((i + 0.5) / w) * FIELD.sx, z = FIELD.minZ + ((j + 0.5) / h) * FIELD.sz
    const o = (j * w + i) * 4
    const blocked = (Math.abs(x - hut.x) < 2.3 && Math.abs(z - hut.z) < 2.0) || Math.hypot(x - fire.x, z - fire.z) < 0.95
      || props.some((p) => Math.hypot(x - p.x, z - p.z) < p.r * 0.45)
    const big = fbm(x * 0.09 + 7, z * 0.09 - 3), mid = fbm(x * 0.32, z * 0.32), small = valueNoise(x * 1.3 + 4, z * 1.3 + 8)
    let d = 0.5 + big * 0.4 + (mid - 0.5) * 0.6 + (small - 0.5) * 0.25
    if (mid < 0.24) d *= 0.12                                             // small bare patches
    const worn = Math.max(0, 1 - Math.hypot(x - fire.x, z - fire.z) / 3.2) + Math.max(0, 1 - Math.hypot(x - (hut.x + 0.5), z - (hut.z + 2.6)) / 2.2)
    d = blocked ? 0 : Math.max(0, Math.min(1, d - worn * 0.55))
    const edge = Math.hypot(x / sx, z) / edgeRadius(Math.atan2(z, x / sx))
    const flower = fbm(x * 0.5 + 20, z * 0.5 - 13) > 0.66
    const dry = fbm(x * 0.11 + 50, z * 0.11 + 31) > 0.6
    const tall = Math.min(1, 0.1 + Math.max(0, edge - 0.6) * 0.9 + (fbm(x * 0.25 + 90, z * 0.25) > 0.62 ? 0.35 : 0))
    data[o] = Math.round(d * 255)
    data[o + 1] = Math.round(mid * 255)
    data[o + 2] = (flower ? 128 : 0) + (dry ? 64 : 0)
    data[o + 3] = Math.round(tall * 255)
    acc += Math.min(1, Math.pow(d, 1.4) * 1.15)
  } }
  return { row, result: (): GrassField => ({ data, meanAcceptance: acc / (w * h) }) }
}
