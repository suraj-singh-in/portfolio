import { describe, expect, it } from 'vitest'
import { CONFIG } from '../config'
import { scatterWorld } from './scatter'
import { clampToClearing, edgeRadius } from './clearing'
import { GATE_PATH, GATE_TILE, PEOPLE, ROAD, STONE_WALL, WALL, createWallCaption, roadQuery, wallXAt } from './road'
import { clampToWorld } from './bounds'

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

  it('turns left (north), then makes one final right turn (east) into the wall', () => {
    const P = ROAD.points, n = P.length
    const heading = (i: number) => ({ x: P[i + 1].x - P[i].x, z: P[i + 1].z - P[i].z })
    const north = P.slice(0, n - 1).map((_, i) => heading(i)).filter((h) => -h.z > Math.abs(h.x)).length
    expect(north).toBeGreaterThan(8)
    for (let i = n - 8; i < n - 1; i++) { const h = heading(i); expect(h.x).toBeGreaterThan(Math.abs(h.z)) }
  })

  it('closes the way north past the turn with a long stone wall, and shows a paved path behind the gate', () => {
    const northMost = Math.min(...ROAD.points.map((p) => p.z))
    expect(STONE_WALL.z).toBeLessThan(northMost - 2)
    const cornerX = ROAD.points.find((p) => p.z < -12)!.x
    expect(STONE_WALL.x0).toBeLessThan(cornerX - 3)
    expect(STONE_WALL.x1).toBeGreaterThanOrEqual(wallXAt(STONE_WALL.z) - 0.5)   // meets the town wall
    expect(GATE_PATH.length).toBeGreaterThanOrEqual(2)
    for (const t of GATE_PATH) expect(t.x).toBeGreaterThan(WALL.x)
  })

  it('turns the town wall a little toward the camera, north end west, so its gate face shows', () => {
    expect(WALL.tilt).toBeGreaterThan(0.2)
    expect(WALL.tilt).toBeLessThan(0.7)
    expect(wallXAt(WALL.z - 5)).toBeLessThan(WALL.x)
    expect(wallXAt(WALL.z + 5)).toBeGreaterThan(WALL.x)
  })

  it('starts the paved path right behind the wall with no gap between tiles', () => {
    const back = wallXAt(WALL.z) + WALL.depth / 2
    expect(GATE_PATH[0].x - GATE_TILE.half).toBeLessThanOrEqual(back + 0.05)
    for (let i = 1; i < GATE_PATH.length; i++) expect(GATE_PATH[i].x - GATE_PATH[i - 1].x).toBeLessThanOrEqual(GATE_TILE.half * 2)
  })

  it('puts a few townsfolk on the far side of the wall, off the walkable road', () => {
    expect(PEOPLE.length).toBeGreaterThanOrEqual(3)
    for (const p of PEOPLE) {
      expect(p.x).toBeGreaterThan(wallXAt(p.z) + WALL.depth)
      expect(clampToWorld(p)).not.toEqual(p)
    }
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
    const blockers = w.obstacles.filter((o) => Math.abs(o.x - wallXAt(o.z)) < 0.01 && Math.abs(o.z - end.z) < 3)
    expect(blockers.length).toBeGreaterThan(0)
  })

  it('wall caption fires once on arrival and again only after walking away', () => {
    const c = createWallCaption()
    const at = { x: WALL.x - 2, z: WALL.z }, away = { x: WALL.x - 12, z: WALL.z }
    expect(c.update(away)).toBe(false)
    expect(c.update(at)).toBe(true)
    expect(c.update(at)).toBe(false)
    expect(c.update(away)).toBe(false)
    expect(c.update(at)).toBe(true)
  })
})
