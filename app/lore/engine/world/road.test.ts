import { describe, expect, it } from 'vitest'
import { CONFIG } from '../config'
import { scatterWorld } from './scatter'
import { clampToClearing, edgeRadius } from './clearing'
import { ROAD, WALL, clampToWorld, createWallCaption, roadQuery } from './road'

const inClearing = (p: { x: number; z: number }) => {
  const sx = p.x / CONFIG.CLEARING.stretchX
  return Math.hypot(sx, p.z) <= edgeRadius(Math.atan2(p.z, sx)) + 1e-6
}
const edgeS = () => { let s = 0; for (const p of ROAD.points) { if (!inClearing(p)) return s; s += 1 } return s }

describe('east road', () => {
  it('starts inside the clearing and runs about 20 s at a run beyond its edge', () => {
    expect(inClearing(ROAD.points[0])).toBe(true)
    const beyond = ROAD.length - edgeS() * ROAD.step
    expect(beyond / CONFIG.PLAYER.run).toBeGreaterThanOrEqual(19.5)
    expect(beyond / CONFIG.PLAYER.run).toBeLessThanOrEqual(24)
  })

  it('heads east (right) and ends at the wall', () => {
    const end = ROAD.points[ROAD.points.length - 1]
    expect(end.x).toBeGreaterThan(60)
    expect(Math.hypot(end.x - WALL.x, end.z - WALL.z)).toBeLessThan(3)
  })

  it('keeps points on the road and inside the clearing as they are', () => {
    const mid = ROAD.points[Math.floor(ROAD.points.length / 2)]
    expect(clampToWorld(mid)).toEqual(mid)
    expect(clampToWorld({ x: -2, z: 1 })).toEqual({ x: -2, z: 1 })
  })

  it('pulls a point beside the road back onto its edge', () => {
    const mid = ROAD.points[Math.floor(ROAD.points.length / 2)]
    const out = clampToWorld({ x: mid.x, z: mid.z + 12 })
    const q = roadQuery(out)
    expect(q.d).toBeLessThanOrEqual(ROAD.halfWidth(q.s) + 1e-6)
    expect(Math.hypot(out.x - mid.x, out.z - mid.z)).toBeLessThan(4)
  })

  it('still pulls points far from the road onto the clearing edge', () => {
    const p = { x: -40, z: 0 }
    expect(clampToWorld(p)).toEqual(clampToClearing(p))
  })

  it('leaves the road clear of trees and thins the forest toward the wall', () => {
    const w = scatterWorld(CONFIG.SEED)
    for (const t of w.trees) { const q = roadQuery(t); expect(q.d).toBeGreaterThan(ROAD.halfWidth(q.s) + 0.9) }
    const near = (s0: number, s1: number) => w.trees.filter((t) => { const q = roadQuery(t); return q.d < ROAD.halfWidth(q.s) + 14 && q.s >= s0 && q.s < s1 }).length
    const startS = edgeS() * ROAD.step
    expect(near(startS + 5, startS + 30)).toBeGreaterThan(near(ROAD.length - 25, ROAD.length) * 2.5)
  })

  it('lines the road with little stones that do not block the way', () => {
    const w = scatterWorld(CONFIG.SEED)
    const stones = w.rocks.filter((r) => { const q = roadQuery(r); return q.s > edgeS() * ROAD.step && q.d < ROAD.halfWidth(q.s) + 0.8 })
    expect(stones.length).toBeGreaterThanOrEqual(20)
    for (const s of stones) expect(s.scale).toBeLessThan(0.4)
    for (const s of stones) expect(w.obstacles.some((o) => o.x === s.x && o.z === s.z)).toBe(false)
  })

  it('blocks the way at the wall', () => {
    const w = scatterWorld(CONFIG.SEED)
    const end = ROAD.points[ROAD.points.length - 1]
    const blockers = w.obstacles.filter((o) => Math.abs(o.z - WALL.z) < 0.01 && Math.abs(o.x - end.x) < 3)
    expect(blockers.length).toBeGreaterThan(0)
  })

  it('wall caption fires once on arrival and again only after walking away', () => {
    const c = createWallCaption()
    const at = { x: WALL.x, z: WALL.z + 2 }, away = { x: WALL.x, z: WALL.z + 12 }
    expect(c.update(away)).toBe(false)
    expect(c.update(at)).toBe(true)
    expect(c.update(at)).toBe(false)
    expect(c.update(away)).toBe(false)
    expect(c.update(at)).toBe(true)
  })
})
