import { describe, expect, it } from 'vitest'
import { createTeardown } from './teardown'
import { safeStorage } from './safeStorage'

describe('teardown (failed start must still release everything)', () => {
  it('runs cleanups in reverse order, exactly once', () => {
    const order: number[] = []
    const td = createTeardown()
    td.add(() => order.push(1)); td.add(() => order.push(2)); td.add(() => order.push(3))
    td.run(); td.run()
    expect(order).toEqual([3, 2, 1])
  })

  it('keeps going when one cleanup throws', () => {
    const order: number[] = []
    const td = createTeardown()
    td.add(() => order.push(1)); td.add(() => { throw new Error('x') }); td.add(() => order.push(3))
    td.run()
    expect(order).toEqual([3, 1])
  })

  it('runs a cleanup added after teardown immediately', () => {
    let ran = false
    const td = createTeardown()
    td.run()
    td.add(() => { ran = true })
    expect(ran).toBe(true)
    expect(td.done).toBe(true)
  })
})

describe('safeStorage (blocked site data must not break the scene)', () => {
  it('falls back to an in-memory store when localStorage access throws', () => {
    const s = safeStorage(() => { throw new DOMException('blocked', 'SecurityError') })
    s.setItem('k', 'v')
    expect(s.getItem('k')).toBe('v')
  })

  it('falls back when getItem itself throws', () => {
    const s = safeStorage(() => ({ getItem: () => { throw new Error('denied') }, setItem: () => {} }) as unknown as Storage)
    expect(s.getItem('k')).toBeNull()
    s.setItem('k', '1')
    expect(s.getItem('k')).toBe('1')
  })
})
