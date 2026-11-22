import { describe, expect, it } from 'vitest'
import { loadAll } from './loader'

const later = <T>(v: T, ms = 1) => () => new Promise<T>((r) => setTimeout(() => r(v), ms))
const fail = (ms = 1) => () => new Promise<never>((_, rej) => setTimeout(() => rej(new Error('nope')), ms))

describe('loadAll', () => {
  it('reports monotonic progress ending at 1', async () => {
    const seen: number[] = []
    const out = await loadAll({ a: later(1, 3), b: later('x', 1), c: later(true, 2) }, [], (p) => seen.push(p))
    expect(out).toEqual({ a: 1, b: 'x', c: true })
    expect(seen.at(-1)).toBe(1)
    for (let i = 1; i < seen.length; i++) expect(seen[i]).toBeGreaterThanOrEqual(seen[i - 1])
  })

  it('resolves an optional failure to null', async () => {
    const out = await loadAll({ model: later('m'), sound: fail() }, ['sound'], () => {})
    expect(out).toEqual({ model: 'm', sound: null })
  })

  it('rejects when a required job fails', async () => {
    await expect(loadAll({ model: fail(), sound: later('s') }, ['sound'], () => {})).rejects.toThrow('nope')
  })
})
