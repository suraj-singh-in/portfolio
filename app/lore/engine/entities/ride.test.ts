import { describe, expect, it } from 'vitest'
import { CONFIG } from '../config'
import type { Circle } from '../core/types'
import { edgeRadius, LAYOUT } from '../world/clearing'
import { createRide, sidePoint, toggleMount, updateRide, type RideState } from './ride'

const still = { x: 0, z: 0, run: false }
const run = (s: RideState, move: { x: number; z: number; run: boolean }, secs: number, t0 = 0, obstacles: Circle[] = []) => {
  let t = t0
  for (let i = 0; i < secs * 100; i++) { t += 0.01; s = updateRide(s, move, 0.01, t, obstacles) }
  return s
}
const riding = (x = 0, z = 0, facing = 0): RideState => ({ ...createRide({ x, z }, facing), phase: 'riding' })

describe('ride', () => {
  it('mounts only within range', () => {
    const s = createRide({ x: 0, z: 0 }, 0)
    expect(toggleMount(s, { x: 2, z: 0 }, 0).phase).toBe('mounting')
    expect(toggleMount(s, { x: 4, z: 0 }, 0).phase).toBe('onFoot')
  })

  it('mounting becomes riding after 1.0 s', () => {
    let s = toggleMount(createRide({ x: 0, z: 0 }, 0), { x: 1, z: 0 }, 0)
    s = updateRide(s, still, 0.016, 0.9, []); expect(s.phase).toBe('mounting')
    s = updateRide(s, still, 0.016, 1.01, []); expect(s.phase).toBe('riding')
  })

  it('dismounting becomes onFoot after 1.0 s', () => {
    let s = toggleMount(riding(), { x: 0, z: 0 }, 5)
    expect(s.phase).toBe('dismounting')
    s = updateRide(s, still, 0.016, 5.9, []); expect(s.phase).toBe('dismounting')
    s = updateRide(s, still, 0.016, 6.01, []); expect(s.phase).toBe('onFoot')
  })

  it('toggle is ignored while mounting/dismounting', () => {
    const m = toggleMount(createRide({ x: 0, z: 0 }, 0), { x: 1, z: 0 }, 0)
    expect(toggleMount(m, { x: 1, z: 0 }, 0.5)).toEqual(m)
    const d = toggleMount(riding(), { x: 0, z: 0 }, 0)
    expect(toggleMount(d, { x: 0, z: 0 }, 0.5)).toEqual(d)
  })

  it('walks at 2.6 m/s and gallops at 6 m/s after accelerating', () => {
    expect(run(riding(), { x: 0, z: 1, run: false }, 3).speed).toBeCloseTo(CONFIG.RIDE.walk, 1)
    expect(run(riding(), { x: 0, z: 1, run: true }, 3).speed).toBeCloseTo(CONFIG.RIDE.gallop, 1)
    expect(run(riding(), { x: 0, z: 1, run: true }, 3).galloping).toBe(true)
  })

  it('turns toward input at no more than 3 rad/s', () => {
    const s = run(riding(0, 0, 0), { x: 0, z: -1, run: false }, 0.5)
    expect(Math.abs(s.facing)).toBeLessThanOrEqual(1.5 + 1e-6)
    expect(Math.abs(s.facing)).toBeGreaterThan(1.4)
  })

  it('does not move or turn while mounting', () => {
    const s0 = toggleMount(createRide({ x: 0, z: 0 }, 0), { x: 1, z: 0 }, 0)
    const s = updateRide(s0, { x: 1, z: 0, run: true }, 0.1, 0.1, [])
    expect([s.x, s.z, s.facing]).toEqual([0, 0, 0])
  })

  it('horse stays inside clearing and out of obstacles at gallop', () => {
    const hut = { ...LAYOUT.hut, r: 2.6 }
    let s = riding(LAYOUT.hut.x + 6, LAYOUT.hut.z, -Math.PI / 2)
    s = run(s, { x: -1, z: 0, run: true }, 10, 0, [hut])
    expect(Math.hypot(s.x - hut.x, s.z - hut.z)).toBeGreaterThanOrEqual(hut.r + CONFIG.RIDE.radius - 1e-6)
    s = run(s, { x: 1, z: 1, run: true }, 30, 10, [hut])
    const sx = s.x / CONFIG.CLEARING.stretchX
    expect(Math.hypot(sx, s.z)).toBeLessThanOrEqual(edgeRadius(Math.atan2(s.z, sx)) + 1e-6)
  })

  it('dismount point is on the left side', () => {
    const p = sidePoint(riding(0, 0, 0), [])
    expect(p.x).toBeCloseTo(CONFIG.RIDE.sideOffset)
    expect(p.z).toBeCloseTo(0)
  })

  it('dismount at the clearing edge with the left side facing out lands clear of the horse, inside the clearing', () => {
    // horse centred on the west edge (east opens onto the road, north onto the mountain track), facing -z so its left (cos f, -sin f) = (-1, 0) points out
    const edgeX = -edgeRadius(Math.PI) * CONFIG.CLEARING.stretchX
    const s = riding(edgeX, 0, Math.PI)
    const horse = { x: s.x, z: s.z, r: 1.35 }
    const rock = { x: s.x - 1.2, z: s.z - 1.6, r: 0.6 }
    const p = sidePoint(s, [horse, rock])
    for (const o of [horse, rock]) expect(Math.hypot(p.x - o.x, p.z - o.z)).toBeGreaterThanOrEqual(o.r + CONFIG.PLAYER.radius - 1e-6)
    const sx = p.x / CONFIG.CLEARING.stretchX
    expect(Math.hypot(sx, p.z)).toBeLessThanOrEqual(edgeRadius(Math.atan2(p.z, sx)) + 1e-6)
  })

  it('side point can be asked for on the right', () => {
    const p = sidePoint(riding(0, 0, 0), [], 'right')
    expect(p.x).toBeCloseTo(-CONFIG.RIDE.sideOffset)
    expect(p.z).toBeCloseTo(0)
  })

  it('dismount point is pushed out of obstacles and clamped', () => {
    const rock = { x: 1.2, z: 0, r: 0.6 }
    const p = sidePoint(riding(0, 0, 0), [rock])
    expect(Math.hypot(p.x - rock.x, p.z - rock.z)).toBeGreaterThanOrEqual(rock.r + CONFIG.PLAYER.radius - 1e-6)
    const edge = sidePoint(riding(-40, 0, Math.PI), [])
    const sx = edge.x / CONFIG.CLEARING.stretchX
    expect(Math.hypot(sx, edge.z)).toBeLessThanOrEqual(edgeRadius(Math.atan2(edge.z, sx)) + 1e-6)
  })
})
