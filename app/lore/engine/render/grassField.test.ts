import { describe, expect, it } from 'vitest'
import { CONFIG } from '../config'
import { LAYOUT } from '../world/clearing'
import { scatterWorld } from '../world/scatter'
import { FIELD, buildGrassField, buildGrassFieldAsync, startGrassField } from './grassField'

// the field covers the clearing and the east road: a full build takes a few seconds in Node
describe('grass field', { timeout: 15000 }, () => {
  const world = scatterWorld(CONFIG.SEED)
  const f = buildGrassField(world)
  const at = (x: number, z: number) => {
    const i = Math.floor(((x - FIELD.minX) / FIELD.sx) * FIELD.w), j = Math.floor(((z - FIELD.minZ) / FIELD.sz) * FIELD.h)
    return f.data[(j * FIELD.w + i) * 4]
  }

  it('has no grass inside the hut or the fire', () => {
    expect(at(LAYOUT.hut.x, LAYOUT.hut.z)).toBe(0)
    expect(at(LAYOUT.fire.x, LAYOUT.fire.z)).toBe(0)
  })

  it('is uneven: dense places and sparse places both exist', () => {
    let hi = 0, lo = 0
    for (let k = 0; k < f.data.length; k += 4) { if (f.data[k] > 200) hi++; if (f.data[k] < 40) lo++ }
    expect(hi).toBeGreaterThan(1000)
    expect(lo).toBeGreaterThan(1000)
  })

  it('reports a mean acceptance in (0, 1]', () => {
    expect(f.meanAcceptance).toBeGreaterThan(0.2)
    expect(f.meanAcceptance).toBeLessThanOrEqual(1)
  })

  it('is deterministic', () => {
    expect(buildGrassField(world).data).toEqual(f.data)
  })

  it('progressive build fills the rows nearest the spawn first and ends equal to the full build', () => {
    const b = startGrassField(world)
    const rowAt = (z: number) => Math.floor(((z - FIELD.minZ) / FIELD.sz) * FIELD.h)
    const rowFilled = (j: number) => { for (let i = 0; i < FIELD.w; i++) if (b.field.data[(j * FIELD.w + i) * 4 + 1] > 0) return true; return false }
    b.stepRows(b.rowsWithin(-20, 20))
    expect(rowFilled(rowAt(0))).toBe(true)
    expect(rowFilled(rowAt(FIELD.minZ + 2))).toBe(false)   // far rows wait for the background
    expect(b.done).toBe(false)
    while (!b.done) b.stepRows(64)
    expect(b.field.data).toEqual(f.data)
  })

  it('async build yields to the browser between chunks and matches the sync result', async () => {
    let yields = 0
    const a = await buildGrassFieldAsync(world, async () => { yields++ })
    expect(yields).toBeGreaterThan(10)
    expect(a.data).toEqual(f.data)
    expect(a.meanAcceptance).toBeCloseTo(f.meanAcceptance, 10)
  })
})
