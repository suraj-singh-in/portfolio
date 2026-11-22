import { describe, expect, it } from 'vitest'
import { createEvents } from './events'
import { createLoop } from './loop'

describe('events', () => {
  it('delivers to subscribers and stops after unsubscribe', () => {
    const ev = createEvents<{ caption: string; progress: number }>()
    const got: string[] = []
    const off = ev.on('caption', (s) => got.push(s))
    ev.emit('caption', 'a'); off(); ev.emit('caption', 'b')
    expect(got).toEqual(['a'])
  })
})

const fakeEnv = () => {
  let now = 0, nextId = 1
  const cbs = new Map<number, FrameRequestCallback>()
  const doc = Object.assign(new EventTarget(), { hidden: false })
  return {
    doc,
    raf: (cb: FrameRequestCallback) => { const id = nextId++; cbs.set(id, cb); return id },
    caf: (id: number) => { cbs.delete(id) },
    tick(ms: number) { now += ms; const list = [...cbs.entries()]; cbs.clear(); for (const [, cb] of list) cb(now) },
    pending: () => cbs.size,
    hide(h: boolean) { doc.hidden = h; doc.dispatchEvent(new Event('visibilitychange')) },
  }
}

describe('loop', () => {
  it('clamps dt to 0.05', () => {
    const env = fakeEnv(); const dts: number[] = []
    const loop = createLoop((dt) => dts.push(dt), env)
    loop.start(); env.tick(16); env.tick(500)
    expect(Math.max(...dts)).toBeCloseTo(0.05)
  })

  it('pauses while the document is hidden and does not jump on resume', () => {
    const env = fakeEnv(); const dts: number[] = []
    const loop = createLoop((dt) => dts.push(dt), env)
    loop.start(); env.tick(16); env.tick(16)
    env.hide(true); env.tick(16)
    const n = dts.length
    env.tick(5000)
    expect(dts.length).toBe(n)
    env.hide(false); env.tick(16); env.tick(16)
    expect(dts.at(-1)).toBeCloseTo(0.016)
    expect(Math.max(...dts.slice(n))).toBeLessThanOrEqual(0.05)
  })

  it('stop cancels the pending frame', () => {
    const env = fakeEnv(); let n = 0
    const loop = createLoop(() => n++, env)
    loop.start(); env.tick(16)
    loop.stop()
    expect(env.pending()).toBe(0)
    expect(loop.running).toBe(false)
    env.tick(16)
    expect(n).toBe(1)
  })
})
