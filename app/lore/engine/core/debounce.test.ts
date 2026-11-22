import { describe, expect, it } from 'vitest'
import { trailingDebounce } from './debounce'

describe('trailingDebounce (resize storms re-bake once)', () => {
  it('runs once after a burst of calls settles', () => {
    let now = 0
    const timers: { at: number; fn: () => void }[] = []
    const sched = { set: (fn: () => void, ms: number) => { timers.push({ at: now + ms, fn }); return timers.length - 1 }, clear: (id: number) => { timers[id] = { at: Infinity, fn: () => {} } } }
    let runs = 0
    const d = trailingDebounce(() => runs++, 150, sched)
    for (let i = 0; i < 40; i++) { now += 10; d.call() }
    now += 200
    timers.filter((t) => t.at <= now).forEach((t) => t.fn())
    expect(runs).toBe(1)
  })

  it('cancel prevents a pending run', () => {
    const timers: (() => void)[] = []
    let runs = 0
    const d = trailingDebounce(() => runs++, 150, { set: (fn) => { timers.push(fn); return timers.length - 1 }, clear: (id) => { timers[id] = () => {} } })
    d.call(); d.cancel()
    timers.forEach((t) => t())
    expect(runs).toBe(0)
  })
})
