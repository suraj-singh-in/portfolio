import { describe, expect, it } from 'vitest'
import { CONFIG } from '../config'
import { clampToWorld, inClearing } from './bounds'
import { LAKE, MOUNTAINS, NORTH, SHORE, createLakeCaption, inEllipse, inLake, lookAhead, shoreZ } from './north'
import { scatterWorld } from './scatter'
import { offTrack } from './track'
import { FIELD, buildGrassField } from '../render/grassField'

const beyondEdge = () => { let s = 0; for (const p of NORTH.points) { if (!inClearing(p)) break; s += NORTH.step } return NORTH.length - s }

describe('north mountain track', () => {
  it('leaves the clearing to the north and takes about 20 s at a run', () => {
    expect(inClearing(NORTH.points[0])).toBe(true)
    expect(NORTH.points[NORTH.points.length - 1].z).toBeLessThan(-65)
    const secs = beyondEdge() / CONFIG.PLAYER.run
    expect(secs).toBeGreaterThanOrEqual(19.5)
    expect(secs).toBeLessThanOrEqual(24)
  })

  it('climbs in switchbacks: at least three legs crossing left and right', () => {
    const P = NORTH.points, dirs: number[] = []
    for (let i = 0; i < P.length - 1; i++) {
      const dx = P[i + 1].x - P[i].x, dz = P[i + 1].z - P[i].z
      if (Math.abs(dx) > Math.abs(dz) * 1.2) { const d = Math.sign(dx); if (dirs[dirs.length - 1] !== d) dirs.push(d) }
    }
    expect(dirs.length).toBeGreaterThanOrEqual(3)
  })

  it('is wide in the foothills, tight in the switchbacks and tightest in the pass', () => {
    expect(NORTH.halfWidth(10)).toBeGreaterThan(3.5)
    expect(NORTH.halfWidth(55)).toBeLessThanOrEqual(2.2)
    expect(NORTH.halfWidth(NORTH.length - 3)).toBeLessThanOrEqual(1.8)
  })

  it('keeps rock between the switchback legs (no shortcut across)', () => {
    const P = NORTH.points
    for (let i = 0; i < P.length; i++) for (let j = i + 24; j < P.length; j++) {   // beyond a hairpin's own bend
      const d = Math.hypot(P[i].x - P[j].x, P[i].z - P[j].z)
      expect(d).toBeGreaterThan(NORTH.halfWidth(i * NORTH.step) + NORTH.halfWidth(j * NORTH.step) + 1.5)
    }
  })

  it('opens onto a shore at the water; the lake itself is not walkable', () => {
    const end = NORTH.points[NORTH.points.length - 1]
    expect(inEllipse(end, SHORE)).toBe(true)
    expect(Math.abs(SHORE.z - SHORE.rz - shoreZ(SHORE.x))).toBeLessThan(0.6)   // shore reaches the water's edge
    for (let x = -SHORE.rx; x <= SHORE.rx; x += 0.5) expect(inLake({ x, z: SHORE.z - SHORE.rz * Math.sqrt(Math.max(0, 1 - (x / SHORE.rx) ** 2)) + 0.05 })).toBe(false)   // no wet feet on the shore
    const lakeMid = { x: 0, z: (shoreZ(0) + LAKE.farZ) / 2 }
    expect(clampToWorld(lakeMid)).not.toEqual(lakeMid)
    const waterline = { x: SHORE.x, z: SHORE.z - SHORE.rz + 0.3 }
    expect(clampToWorld(waterline)).toEqual(waterline)
  })

  it('keeps track points and pulls a point between two legs back onto a leg', () => {
    for (const p of NORTH.points) expect(clampToWorld(p)).toEqual(p)
    const P = NORTH.points
    const a = P[Math.round(48 / NORTH.step)], b = P[Math.round(70 / NORTH.step)]
    const between = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 }
    const c = clampToWorld(between)
    const q = NORTH.query(c)
    expect(q.d).toBeLessThanOrEqual(NORTH.halfWidth(q.s) + 1e-6)
  })

  it('stretches the lake to the horizon: across the whole view, from the shore to the mountains', () => {
    expect(LAKE.half).toBeGreaterThanOrEqual(50)
    for (let x = -LAKE.half; x <= LAKE.half; x += 5) { expect(inLake({ x, z: shoreZ(x) - 0.1 })).toBe(true); expect(inLake({ x, z: LAKE.farZ - 20 })).toBe(true) }
    expect(LAKE.farZ).toBeLessThan(shoreZ(0) - 6)
  })

  it('stands the mountains right behind the lake', () => {
    // a whole range along the far shore, wider than the widest view
    expect(Math.min(...MOUNTAINS.map((m) => m.x))).toBeLessThan(-30)
    expect(Math.max(...MOUNTAINS.map((m) => m.x))).toBeGreaterThan(30)
    for (const m of MOUNTAINS) {
      expect(m.z).toBeLessThan(LAKE.farZ + 0.5)
      expect(m.z).toBeGreaterThan(LAKE.farZ - 3)
    }
  })

  it('lake caption fires once on reaching the water and again only after walking back down', () => {
    const c = createLakeCaption()
    const water = { x: SHORE.x, z: SHORE.z - SHORE.rz + 0.6 }, pass = NORTH.points[NORTH.points.length - 8]
    expect(c.update(pass)).toBe(false)
    expect(c.update(water)).toBe(true)
    expect(c.update(water)).toBe(false)
    expect(c.update(pass)).toBe(false)
    expect(c.update(water)).toBe(true)
  })

  it('eases the camera forward only near the shore', () => {
    expect(lookAhead(NORTH.points[20])).toBe(0)
    expect(lookAhead({ x: SHORE.x, z: SHORE.z - SHORE.rz + 0.5 })).toBeGreaterThan(5)
  })

  describe('scenery', () => {
    const w = scatterWorld(CONFIG.SEED)
    const startS = NORTH.length - beyondEdge()
    const onTrack = (p: { x: number; z: number }) => offTrack(NORTH, p) <= 0

    it('lines the climb with cliffs on its far side, never on the walkable ground', () => {
      const near = w.cliffs.filter((c) => { const q = NORTH.query(c); return q.s > 30 && q.d < NORTH.halfWidth(q.s) + 6 })
      expect(near.length).toBeGreaterThanOrEqual(12)
      // tall rock stands on the far (north) side, so it never hides the leg below it from the camera
      const uphill = near.filter((c) => c.z < NORTH.query(c).at.z).length
      expect(uphill / near.length).toBeGreaterThan(0.8)
      for (const c of w.cliffs) expect(clampToWorld(c)).not.toEqual(c)
    })

    it('keeps trees and undergrowth off the track and the shore', () => {
      for (const t of [...w.trees, ...w.undergrowth]) { expect(onTrack(t)).toBe(false); expect(inEllipse(t, SHORE)).toBe(false) }
    })

    it('puts blocking boulders in the foothills that never close the way', () => {
      const inside = w.obstacles.filter((o) => onTrack(o) && NORTH.query(o).s > startS && NORTH.query(o).s < 30)
      expect(inside.length).toBeGreaterThanOrEqual(4)
      for (const o of inside) { const q = NORTH.query(o); expect(NORTH.halfWidth(q.s) - (o.r - q.d)).toBeGreaterThan(2); expect(o.r).toBeLessThanOrEqual(0.35) }   // small stones, not walls
    })

    it('scatters scree over the track that does not block', () => {
      const scree = w.rocks.filter((r) => onTrack(r) && /scree|pebbles/.test(r.sprite))
      expect(scree.length).toBeGreaterThanOrEqual(40)
      for (const r of scree) expect(w.obstacles.some((o) => o.x === r.x && o.z === r.z)).toBe(false)
    })

    it('grows no grass in the lake and thinner grass high on the climb', { timeout: 20000 }, () => {
      const f = buildGrassField(w)
      const at = (p: { x: number; z: number }) => { const i = Math.floor(((p.x - FIELD.minX) / FIELD.sx) * FIELD.w), j = Math.floor(((p.z - FIELD.minZ) / FIELD.sz) * FIELD.h); return f.data[(j * FIELD.w + i) * 4] / 255 }
      expect(at({ x: 0, z: (shoreZ(0) + LAKE.farZ) / 2 })).toBe(0)
      expect(at({ x: 20, z: shoreZ(20) - 0.5 })).toBe(0)
      expect(at({ x: 0, z: LAKE.farZ - 10 })).toBe(0)   // nothing grows beyond the water
      const mean = (s0: number, s1: number) => { let a = 0, n = 0; for (let s = s0; s < s1; s += 1) { a += at(NORTH.points[Math.round(s / NORTH.step)]); n++ } return a / n }
      expect(mean(60, 90)).toBeLessThan(mean(startS, startS + 20) * 0.7)
    })
  })
})
