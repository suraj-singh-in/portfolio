import { describe, expect, it } from 'vitest'
import { createTrample } from './trample'

const run = (tr: ReturnType<typeof createTrample>, secs: number) => { for (let i = 0; i < secs * 10; i++) tr.update(0.1) }

describe('trample', () => {
  it('raises the amount under the foot', () => {
    const tr = createTrample()
    tr.stamp(1, 2, 1, 0, 2, 0.4)
    tr.update(0)
    expect(tr.amountAt(1, 2)).toBeGreaterThan(0.8)
    expect(tr.amountAt(5, 5)).toBe(0)
  })

  it('recovers within 12.5 s but not within 5 s', () => {
    const tr = createTrample()
    tr.stamp(0, 0, 0, 1, 2, 0.4)
    run(tr, 5)
    expect(tr.amountAt(0, 0)).toBeGreaterThan(0)
    run(tr, 7.5)
    expect(tr.amountAt(0, 0)).toBe(0)
  })

  it('pressed direction follows the walk direction', () => {
    const tr = createTrample()
    tr.stamp(0, 0, 1, 0, 2, 0.4)
    const d = tr.directionAt(0, 0)
    expect(d.x).toBeGreaterThan(0.9)
    expect(Math.abs(d.z)).toBeLessThan(0.3)
  })

  it('ignores stamps outside its bounds', () => {
    const tr = createTrample()
    expect(() => tr.stamp(500, 500, 1, 0, 2, 0.4)).not.toThrow()
    expect(tr.amountAt(500, 500)).toBe(0)
  })
})
