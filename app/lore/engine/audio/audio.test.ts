import { describe, expect, it } from 'vitest'
import { createAudio, type AudioLike } from './audio'

const fakeAudio = (rejectFirst = false) => {
  const made: (AudioLike & { plays: number; paused: boolean })[] = []
  const make = () => {
    let first = rejectFirst
    const a = {
      loop: false, volume: 1, muted: false, currentTime: 0, playbackRate: 1, plays: 0, paused: true,
      play() { a.plays++; if (first) { first = false; return Promise.reject(new Error('blocked')) } a.paused = false; return Promise.resolve() },
      pause() { a.paused = true },
    }
    made.push(a); return a
  }
  return { made, make }
}
const memStorage = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) } }
const flush = () => new Promise((r) => setTimeout(r, 0))

describe('audio', () => {
  it('persists mute across controllers', () => {
    const storage = memStorage()
    const a = createAudio({ ambienceUrl: 'a', stepUrl: 's', make: fakeAudio().make, storage })
    expect(a.toggleMute()).toBe(true)
    expect(storage.getItem('lore:muted')).toBe('1')
    const b = createAudio({ ambienceUrl: 'a', stepUrl: 's', make: fakeAudio().make, storage })
    expect(b.isMuted()).toBe(true)
  })

  it('retries unlock after a rejected play()', async () => {
    const f = fakeAudio(true)
    const a = createAudio({ ambienceUrl: 'a', stepUrl: 's', make: f.make, storage: memStorage() })
    a.unlock(); await flush()
    a.unlock(); await flush()
    expect(f.made[0].plays).toBe(2)
    expect(f.made[0].paused).toBe(false)
  })

  it('plays footsteps at the walk and run intervals', async () => {
    const f = fakeAudio()
    const a = createAudio({ ambienceUrl: 'a', stepUrl: 's', make: f.make, storage: memStorage() })
    a.unlock(); await flush()
    const steps = () => f.made.slice(1).reduce((n, x) => n + x.plays, 0)
    for (let i = 0; i < 100; i++) a.step(0.01, true, false)
    expect(steps()).toBe(2)
    const before = steps()
    for (let i = 0; i < 100; i++) a.step(0.01, true, true)
    expect(steps() - before).toBeGreaterThanOrEqual(3)
    expect(steps() - before).toBeLessThanOrEqual(4)
    const idle = steps()
    for (let i = 0; i < 100; i++) a.step(0.01, false, false)
    expect(steps()).toBe(idle)
  })

  it('dispose pauses ambience', async () => {
    const f = fakeAudio()
    const a = createAudio({ ambienceUrl: 'a', stepUrl: 's', make: f.make, storage: memStorage() })
    a.unlock(); await flush()
    a.dispose()
    expect(f.made[0].paused).toBe(true)
  })

  it('still works when storage.getItem throws', () => {
    const storage = { getItem: () => { throw new Error('denied') }, setItem: () => { throw new Error('denied') } }
    const a = createAudio({ ambienceUrl: 'a', stepUrl: 's', make: fakeAudio().make, storage })
    expect(a.isMuted()).toBe(false)
    expect(a.toggleMute()).toBe(true)
  })

  it('reports blocked then on, so the loading screen can ask for a click', async () => {
    const states: string[] = []
    const f = fakeAudio(true)
    const a = createAudio({ ambienceUrl: 'a', stepUrl: 's', make: f.make, storage: memStorage(), onState: (st) => states.push(st) })
    a.unlock(); await flush()
    a.unlock(); await flush()
    expect(states).toEqual(['blocked', 'on'])
  })
})
