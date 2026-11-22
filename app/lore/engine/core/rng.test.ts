import { describe, expect, it } from 'vitest'
import { fbm, mulberry32, valueNoise } from './rng'

describe('mulberry32', () => {
  it('is deterministic for a seed', () => {
    const a = mulberry32(20261121), b = mulberry32(20261121)
    const xs = Array.from({ length: 5 }, a), ys = Array.from({ length: 5 }, b)
    expect(xs).toEqual(ys)
    for (const v of xs) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1) }
  })

  it('differs by seed', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)())
  })
})

describe('noise', () => {
  it('fbm stays in range and is smooth', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 1000; i++) {
      const x = (r() - 0.5) * 200, z = (r() - 0.5) * 200
      const v = fbm(x, z)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
      expect(Math.abs(v - fbm(x + 0.001, z))).toBeLessThan(0.01)
    }
  })

  it('valueNoise stays in range', () => {
    for (let x = -5; x < 5; x += 0.37) expect(valueNoise(x, x * 0.7)).toBeGreaterThanOrEqual(0)
  })
})
