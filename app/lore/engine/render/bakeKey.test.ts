import { describe, expect, it } from 'vitest'
import { bakeKey } from './bakeKey'

describe('bakeKey', () => {
  it('ignores wind sway, which is applied at draw time', () => {
    expect(bakeKey('fir_a', 1, [4, 6], { tint: 0.78, sway: 0.013 })).toBe(bakeKey('fir_a', 1, [4, 6], { tint: 0.78, sway: 0.02 }))
  })
  it('separates different looks and scales', () => {
    expect(bakeKey('fir_a', 1, [4, 6], { tint: 0.78 })).not.toBe(bakeKey('fir_a', 1, [4, 6], { tint: 0.5 }))
    expect(bakeKey('fir_a', 1, [4, 6], {})).not.toBe(bakeKey('fir_a', 1.5, [4, 6], {}))
  })
})
