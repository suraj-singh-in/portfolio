import { beforeEach, describe, expect, it } from 'vitest'
import { createInput, type Input } from './input'

const key = (type: string, code: string, extra: Record<string, unknown> = {}) => Object.assign(new Event(type), { code, repeat: false, ...extra })

describe('input', () => {
  let target: EventTarget
  let input: Input
  beforeEach(() => { target = new EventTarget(); input = createInput(target) })

  it('maps W and ArrowUp to moveUp', () => {
    target.dispatchEvent(key('keydown', 'KeyW'))
    expect(input.isDown('moveUp')).toBe(true)
    target.dispatchEvent(key('keyup', 'KeyW'))
    target.dispatchEvent(key('keydown', 'ArrowUp'))
    expect(input.isDown('moveUp')).toBe(true)
  })

  it('moveVector is normalised for diagonals', () => {
    target.dispatchEvent(key('keydown', 'KeyW'))
    target.dispatchEvent(key('keydown', 'KeyD'))
    const v = input.moveVector()
    expect(v.x).toBeCloseTo(Math.SQRT1_2)
    expect(v.z).toBeCloseTo(-Math.SQRT1_2)
    expect(v.run).toBe(false)
  })

  it('onPress fires once per keydown, not on repeat', () => {
    let n = 0
    input.onPress('interact', () => n++)
    target.dispatchEvent(key('keydown', 'KeyE'))
    target.dispatchEvent(key('keydown', 'KeyE', { repeat: true }))
    expect(n).toBe(1)
  })

  it('blur clears held keys', () => {
    target.dispatchEvent(key('keydown', 'KeyW'))
    target.dispatchEvent(new Event('blur'))
    expect(input.isDown('moveUp')).toBe(false)
    expect(input.moveVector()).toEqual({ x: 0, z: 0, run: false })
  })

  it('debug actions do nothing without debug flag', () => {
    let n = 0
    input.onPress('debugRaw', () => n++)
    target.dispatchEvent(key('keydown', 'KeyT'))
    expect(n).toBe(0)
    const dbg = createInput(target, { debug: true })
    dbg.onPress('debugRaw', () => n++)
    target.dispatchEvent(key('keydown', 'KeyT'))
    expect(n).toBe(1)
  })

  it('wheel accumulates and takeWheel resets', () => {
    target.dispatchEvent(Object.assign(new Event('wheel'), { deltaY: -100 }))
    target.dispatchEvent(Object.assign(new Event('wheel'), { deltaY: -100 }))
    expect(input.takeWheel()).toBe(-200)
    expect(input.takeWheel()).toBe(0)
  })

  it('dispose removes all listeners', () => {
    input.dispose()
    target.dispatchEvent(key('keydown', 'KeyW'))
    expect(input.isDown('moveUp')).toBe(false)
  })
})
