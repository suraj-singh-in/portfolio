import { describe, expect, it } from 'vitest'
import { detectWebGL } from './detectWebGL'
import { isDesktop } from './isDesktop'
import { applyNameLabel } from './nameLabel'

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

describe('detectWebGL releases its probe context', () => {
  it('calls WEBGL_lose_context.loseContext on the probe', () => {
    let lost = 0
    const ok = detectWebGL(() => ({ getContext: () => ({ getExtension: (n: string) => (n === 'WEBGL_lose_context' ? { loseContext: () => { lost++ } } : null) }) }))
    expect(ok).toBe(true)
    expect(lost).toBe(1)
  })
})

describe('applyNameLabel writes straight to the element (no React state per frame)', () => {
  it('sets transform and opacity', () => {
    const el = { style: { transform: '', opacity: '' } }
    applyNameLabel(el, { x: 100.4, y: 50.6, opacity: 0.5 })
    expect(el.style.transform).toBe('translate(100px, 51px) translate(-50%, -100%)')
    expect(el.style.opacity).toBe('0.5')
  })
})
