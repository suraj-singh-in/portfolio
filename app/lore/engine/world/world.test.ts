import { describe, expect, it } from 'vitest'
import { CONFIG } from '../config'
import { LAYOUT, clampToClearing, edgeRadius, resolveCollisions } from './clearing'
import { scatterWorld } from './scatter'

const stretched = (p: { x: number; z: number }) => {
  const sx = p.x / CONFIG.CLEARING.stretchX
  return { r: Math.hypot(sx, p.z), a: Math.atan2(p.z, sx) }
}

describe('clearing edge', () => {
  it('varies with angle (not a circle)', () => {
    const rs = Array.from({ length: 360 }, (_, i) => edgeRadius((i / 360) * Math.PI * 2))
    expect(Math.max(...rs) - Math.min(...rs)).toBeGreaterThan(3)
  })

  it('clampToClearing keeps inside points and pulls outside points onto the edge', () => {
    expect(clampToClearing({ x: 1, z: 1 })).toEqual({ x: 1, z: 1 })
    const p = clampToClearing({ x: 100, z: 40 })
    const s = stretched(p)
    expect(s.r).toBeCloseTo(edgeRadius(s.a), 5)
  })
})

describe('collisions', () => {
  it('pushes a point out of the hut circle', () => {
    const p = resolveCollisions({ x: LAYOUT.hut.x + 0.5, z: LAYOUT.hut.z }, [{ ...LAYOUT.hut, r: 2.6 }], 0.35)
    expect(Math.hypot(p.x - LAYOUT.hut.x, p.z - LAYOUT.hut.z)).toBeCloseTo(2.95, 5)
  })
})

describe('scatterWorld', () => {
  const w = scatterWorld(CONFIG.SEED)

  it('is deterministic for a seed', () => {
    expect(JSON.stringify(scatterWorld(CONFIG.SEED))).toBe(JSON.stringify(w))
  })

  it('places no tree inside the clearing', () => {
    expect(w.trees.length).toBeGreaterThan(200)
    for (const t of w.trees) { const s = stretched(t); expect(s.r).toBeGreaterThan(edgeRadius(s.a)) }
  })

  it('gives about half the clearing rocks grass tufts (road stones have none)', () => {
    const big = w.rocks.filter((r) => r.scale >= 0.4)
    const share = big.filter((r) => r.tufts).length / big.length
    expect(share).toBeGreaterThan(0.3)
    expect(share).toBeLessThan(0.7)
    for (const r of w.rocks) if (r.tufts) { expect(r.tuftCount).toBeGreaterThanOrEqual(150); expect(r.tuftCount).toBeLessThanOrEqual(600) }
  })

  it('makes hut, fire, horse, log and gnarled tree obstacles', () => {
    for (const k of ['hut', 'fire', 'horse', 'log', 'gnarled'] as const)
      expect(w.obstacles.some((o) => o.x === LAYOUT[k].x && o.z === LAYOUT[k].z)).toBe(true)
  })
})
