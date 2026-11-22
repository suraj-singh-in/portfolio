import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../core/rng'
import { edgeRadius } from '../world/clearing'
import { CONFIG } from '../config'
import { createPlayer, faceToward, updatePlayer } from './player'
import { createHorse, horseLookAngle, reactionSide, strokeHorse, updateHorse } from './horse'

const step = (s: ReturnType<typeof createPlayer>, move: { x: number; z: number; run: boolean }, secs: number, t0 = 0) => {
  let t = t0
  for (let i = 0; i < secs * 100; i++) { t += 0.01; s = updatePlayer(s, move, 0.01, t, []) }
  return s
}

describe('player', () => {
  it('walks 2.0 m/s and runs 4.6 m/s', () => {
    const p0 = { ...createPlayer(), x: 0, z: 0 }
    expect(step(p0, { x: 1, z: 0, run: false }, 1).x).toBeCloseTo(2.0, 1)
    expect(step(p0, { x: 1, z: 0, run: true }, 1).x).toBeCloseTo(4.6, 1)
  })

  it('stays inside the clearing after walking outward for 30 s', () => {
    const p = step({ ...createPlayer(), x: 0, z: 0 }, { x: 0.6, z: 0.8, run: true }, 30)
    const sx = p.x / CONFIG.CLEARING.stretchX
    expect(Math.hypot(sx, p.z)).toBeLessThanOrEqual(edgeRadius(Math.atan2(p.z, sx)) + 1e-6)
  })

  it('ignores movement while stroking, then returns to free', () => {
    let p = faceToward({ ...createPlayer(), x: 0, z: 0 }, { x: 1, z: 0 }, 0)
    expect(p.mode).toBe('stroke')
    expect(p.facing).toBeCloseTo(Math.PI / 2)
    p = updatePlayer(p, { x: 0, z: 1, run: false }, 0.5, 1, [])
    expect(p.z).toBe(0)
    p = updatePlayer(p, { x: 0, z: 0, run: false }, 0.016, 2.7, [])
    expect(p.mode).toBe('free')
  })

  it('reports moving and running', () => {
    const p = updatePlayer(createPlayer(), { x: 1, z: 0, run: true }, 0.016, 0.016, [])
    expect(p.moving).toBe(true)
    expect(p.running).toBe(true)
  })
})

describe('horse', () => {
  const rand = mulberry32(1)

  it('becomes alert under 5 m, stays alert until over 6.5 m', () => {
    let h = createHorse()
    h = updateHorse(h, 4.9, 1, rand); expect(h.mode).toBe('alert')
    h = updateHorse(h, 6, 2, rand); expect(h.mode).toBe('alert')
    h = updateHorse(h, 6.6, 3, rand); expect(h.mode).toBe('graze')
  })

  it('stroke lasts 3.2 s then alert', () => {
    let h = strokeHorse(createHorse(), 10, 'left')
    expect(h.mode).toBe('stroked')
    h = updateHorse(h, 1, 13.1, rand); expect(h.mode).toBe('stroked')
    h = updateHorse(h, 1, 13.3, rand); expect(h.mode).toBe('alert')
  })

  it('changes graze clip only after nextSwitch, scheduling 6–12 s ahead', () => {
    let h = updateHorse(createHorse(), 20, 0, rand)
    const next = h.nextSwitch
    expect(next).toBeGreaterThanOrEqual(6); expect(next).toBeLessThanOrEqual(12)
    const clip = h.clip
    h = updateHorse(h, 20, next - 0.1, rand)
    expect(h.clip).toBe(clip)
  })

  it('look angle is 0 while grazing and clamped to ±0.9', () => {
    expect(horseLookAngle(0, { x: 0, z: 0 }, { x: 3, z: 0 }, 'graze')).toBe(0)
    const a = horseLookAngle(0, { x: 0, z: 0 }, { x: 0, z: -3 }, 'alert')
    expect(Math.abs(a)).toBeCloseTo(0.9)
    expect(horseLookAngle(0, { x: 0, z: 0 }, { x: 0.3, z: 3 }, 'alert')).toBeCloseTo(Math.atan2(0.3, 3))
  })

  it('E plays the side reaction first, then settles into Idle', () => {
    let h = strokeHorse(createHorse(), 10, 'left')
    expect(h.clip).toBe('Idle_HitReact_Left')
    h = updateHorse(h, 1, 10.3, rand); expect(h.clip).toBe('Idle_HitReact_Left')
    h = updateHorse(h, 1, 10.8, rand); expect(h.clip).toBe('Idle')
    expect(strokeHorse(createHorse(), 0, 'right').clip).toBe('Idle_HitReact_Right')
  })

  it('reaction side follows which side of the horse the player stands', () => {
    expect(reactionSide(0, { x: 0, z: 0 }, { x: 2, z: 0 })).toBe('left')
    expect(reactionSide(0, { x: 0, z: 0 }, { x: -2, z: 0 })).toBe('right')
  })
})
