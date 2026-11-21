import { describe, expect, it } from 'vitest'
import { detectWebGL } from './detectWebGL'
import { isDesktop } from './isDesktop'

describe('isDesktop', () => {
  it('accepts a wide fine-pointer window', () => expect(isDesktop({ width: 1440, coarsePointer: false })).toBe(true))
  it('rejects a window narrower than 900 px', () => expect(isDesktop({ width: 899, coarsePointer: false })).toBe(false))
  it('rejects touch devices even when wide', () => expect(isDesktop({ width: 1440, coarsePointer: true })).toBe(false))
})

describe('detectWebGL', () => {
  it('is false when no webgl2 context can be created', () => expect(detectWebGL(() => ({ getContext: () => null }))).toBe(false))
  it('is true when a webgl2 context exists', () => expect(detectWebGL(() => ({ getContext: (id: string) => (id === 'webgl2' ? {} : null) }))).toBe(true))
  it('is false when creating the canvas throws', () => expect(detectWebGL(() => { throw new Error('no dom') })).toBe(false))
})
