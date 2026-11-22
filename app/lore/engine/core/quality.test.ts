import { describe, expect, it } from 'vitest'
import { pickTier } from './quality'

describe('pickTier', () => {
  it('override wins', () => {
    expect(pickTier({ renderer: 'Intel(R) UHD Graphics', frameMs: 40 }, 'high').name).toBe('high')
  })
  it('discrete GPU at 6 ms gets high with 6,000,000 blades', () => {
    expect(pickTier({ renderer: 'NVIDIA GeForce RTX 3060', frameMs: 6 })).toEqual({ name: 'high', grass: 6_000_000 })
  })
  it('integrated Intel GPU gets at most medium', () => {
    expect(pickTier({ renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 620)', frameMs: 6 })).toEqual({ name: 'medium', grass: 3_000_000 })
  })
  it('integrated AMD Radeon(TM) Graphics gets at most medium', () => {
    expect(pickTier({ renderer: 'ANGLE (AMD, AMD Radeon(TM) Graphics (0x00001636) Direct3D11)', frameMs: 6 }).name).toBe('medium')
  })
  it('slow frames get low', () => {
    expect(pickTier({ renderer: 'NVIDIA GeForce RTX 3060', frameMs: 30 })).toEqual({ name: 'low', grass: 1_500_000 })
  })
  it('below 60 fps (21 ms) drops to low', () => {
    expect(pickTier({ renderer: 'AMD Radeon(TM) Graphics', frameMs: 21 }).name).toBe('low')
  })
  it('ignores an unknown override', () => {
    expect(pickTier({ renderer: 'NVIDIA', frameMs: 6 }, 'ultra').name).toBe('high')
  })
})
