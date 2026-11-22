import { describe, expect, it } from 'vitest'
import { CONFIG } from '../config'
import { clampToWorld, inClearing } from './bounds'
import { LAKE, MOUNTAINS, NORTH, SHORE, createLakeCaption, inEllipse, inLake, inMeadow, lookAhead, meadowRadius, shoreZ } from './north'
import { scatterWorld } from './scatter'
import { offTrack } from './track'
import { FIELD, buildGrassField } from '../render/grassField'

const beyondEdge = () => { let s = 0; for (const p of NORTH.points) { if (!inClearing(p)) break; s += NORTH.step } return NORTH.length - s }

describe('north mountain track', () => {
  it('leaves the clearing to the north on a long climb (about half a minute at a run)', () => {
    expect(inClearing(NORTH.points[0])).toBe(true)
    expect(NORTH.points[NORTH.points.length - 1].z).toBeLessThan(-65)
    const secs = beyondEdge() / CONFIG.PLAYER.run
    expect(secs).toBeGreaterThanOrEqual(28)
    expect(secs).toBeLessThanOrEqual(38)
  })

  it('climbs in switchbacks: at least two S-turns (five legs crossing left and right)', () => {
    const P = NORTH.points, dirs: number[] = []
    for (let i = 0; i < P.length - 1; i++) {
      const dx = P[i + 1].x - P[i].x, dz = P[i + 1].z - P[i].z
      if (Math.abs(dx) > Math.abs(dz) * 1.2) { const d = Math.sign(dx); if (dirs[dirs.length - 1] !== d) dirs.push(d) }
    }
    expect(dirs.length).toBeGreaterThanOrEqual(5)
  })

  it('is wide in the foothills, tight in the switchbacks and tightest in the pass', () => {
    expect(NORTH.halfWidth(10)).toBeGreaterThan(3.5)
    expect(NORTH.halfWidth(60)).toBeGreaterThanOrEqual(2.2)   // a comfortable lane…
    expect(NORTH.halfWidth(60)).toBeLessThanOrEqual(2.8)
    expect(NORTH.halfWidth(NORTH.length - 3)).toBeLessThan(NORTH.halfWidth(60))   // …that narrows into the pass
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
    expect(inMeadow(end)).toBe(true)
    for (let x = -10; x <= 10; x += 0.5) expect(inMeadow({ x, z: shoreZ(x) + 0.3 })).toBe(true)   // the meadow runs right down to the water
    for (let x = -10; x <= 10; x += 0.5) expect(inLake(clampToWorld({ x, z: shoreZ(x) - 0.3 }))).toBe(false)   // no wet feet
    const lakeMid = { x: 0, z: (shoreZ(0) + LAKE.farZ) / 2 }
    expect(clampToWorld(lakeMid)).not.toEqual(lakeMid)
    const waterline = { x: SHORE.x, z: shoreZ(SHORE.x) + 0.3 }
    expect(clampToWorld(waterline)).toEqual(waterline)
  })

  it('pushing into the water stops you at the waterline without sliding sideways', () => {
    for (const x of [-12, -6.3, -0.5, 0.02, 3.7, 11]) {
      const c = clampToWorld({ x, z: shoreZ(x) - 0.25 })
      expect(Math.abs(c.x - x)).toBeLessThan(0.05)
      expect(inLake(c)).toBe(false)
    }
  })

  it('pulls a point just outside the meadow onto its nearest edge, not across it', () => {
    for (const p of [{ x: -24, z: -80 }, { x: 25, z: -78 }, { x: -12, z: -73 }]) {
      const c = clampToWorld(p)
      expect(Math.hypot(c.x - p.x, c.z - p.z)).toBeLessThan(4)
    }
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

  it('stands rows of mountains in the water, larger the further back, wider than any view', () => {
    expect(Math.min(...MOUNTAINS.map((m) => m.x))).toBeLessThan(-30)
    expect(Math.max(...MOUNTAINS.map((m) => m.x))).toBeGreaterThan(30)
    for (const m of MOUNTAINS) expect(inLake(m)).toBe(true)                 // their feet are in the lake
    const rows = [...new Set(MOUNTAINS.map((m) => m.row))].sort()
    expect(rows.length).toBeGreaterThanOrEqual(3)
    const z = (r: number) => Math.max(...MOUNTAINS.filter((m) => m.row === r).map((m) => m.z))
    const sc = (r: number) => Math.min(...MOUNTAINS.filter((m) => m.row === r).map((m) => m.scale))
    for (let i = 1; i < rows.length; i++) { expect(z(rows[i])).toBeLessThan(z(rows[i - 1]) - 5); expect(sc(rows[i])).toBeGreaterThan(sc(rows[i - 1]) * 0.95) }
    // the water runs on behind the front row, so the lake wraps around the peaks
    expect(LAKE.farZ).toBeLessThan(z(rows[0]) - 6)
  })

  it('opens into a long, wide lakeside meadow with an uneven edge', () => {
    expect(SHORE.rx).toBeGreaterThanOrEqual(20)
    expect(SHORE.rz).toBeGreaterThanOrEqual(6)
    const radii = Array.from({ length: 72 }, (_, i) => meadowRadius((i / 72) * Math.PI * 2))
    expect(Math.max(...radii) / Math.min(...radii)).toBeGreaterThan(1.25)   // not an oval
    expect(inMeadow({ x: SHORE.x, z: SHORE.z })).toBe(true)
  })

  it('lake caption fires once on reaching the water and again only after walking back down', () => {
    const c = createLakeCaption()
    const water = { x: SHORE.x, z: shoreZ(SHORE.x) + 0.6 }, pass = NORTH.points[NORTH.points.length - 8]
    expect(c.update(pass)).toBe(false)
    expect(c.update(water)).toBe(true)
    expect(c.update(water)).toBe(false)
    expect(c.update(pass)).toBe(false)
    expect(c.update(water)).toBe(true)
  })

  it('eases the camera forward only near the shore', () => {
    expect(lookAhead(NORTH.points[20])).toBe(0)
    expect(lookAhead({ x: SHORE.x, z: shoreZ(SHORE.x) + 0.5 })).toBeGreaterThan(5)
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

    it('keeps trees off the track and the meadow; plants grow around the meadow but not on the track', () => {
      for (const t of w.trees) { expect(onTrack(t)).toBe(false); expect(inEllipse(t, SHORE)).toBe(false) }
      for (const u of w.undergrowth) expect(onTrack(u)).toBe(false)
      const meadow = w.undergrowth.filter((u) => inEllipse(u, { ...SHORE, rx: SHORE.rx + 4, rz: SHORE.rz + 3 }) && !inLake(u))
      expect(meadow.length).toBeGreaterThanOrEqual(10)
    })

    it('lines both edges of the climb with boulders, so the way shows itself', () => {
      const edge = w.rocks.filter((r) => /^boulder_/.test(r.sprite)).filter((r) => { const q = NORTH.query(r); return q.s > startS && Math.abs(q.d - NORTH.halfWidth(q.s)) < 1.2 })
      expect(edge.length).toBeGreaterThan(((NORTH.length - startS) * 2) / 2)   // about one per metre each side
    })

    it('keeps the middle of the lane nearly clear: only a few small stones block, never the way', () => {
      const inside = w.obstacles.filter((o) => onTrack(o) && NORTH.query(o).s > startS && NORTH.query(o).s < 30)
      expect(inside.length).toBeLessThanOrEqual(3)
      for (const o of inside) { const q = NORTH.query(o); expect(NORTH.halfWidth(q.s) - (o.r - q.d)).toBeGreaterThan(2); expect(o.r).toBeLessThanOrEqual(0.35) }   // small stones, not walls
    })

    it('keeps loose scree to the sides of the lane, never blocking', () => {
      const scree = w.rocks.filter((r) => onTrack(r) && /scree|pebbles/.test(r.sprite))
      const middle = scree.filter((r) => { const q = NORTH.query(r); return q.d < NORTH.halfWidth(q.s) * 0.45 })
      expect(middle.length).toBeLessThanOrEqual(4)
      for (const r of scree) expect(w.obstacles.some((o) => o.x === r.x && o.z === r.z)).toBe(false)
    })

    it('grows no grass in the lake and thinner grass high on the climb', { timeout: 20000 }, () => {
      const f = buildGrassField(w)
      const at = (p: { x: number; z: number }) => { const i = Math.floor(((p.x - FIELD.minX) / FIELD.sx) * FIELD.w), j = Math.floor(((p.z - FIELD.minZ) / FIELD.sz) * FIELD.h); return f.data[(j * FIELD.w + i) * 4] / 255 }
      expect(at({ x: 0, z: (shoreZ(0) + LAKE.farZ) / 2 })).toBe(0)
      expect(at({ x: 20, z: shoreZ(20) - 0.5 })).toBe(0)
      expect(at({ x: 0, z: LAKE.farZ - 10 })).toBe(0)   // nothing grows beyond the water
      // knee-high grass in the meadow by the water: tall-wisp share (A) and height (G) both high
      const ch = (p: { x: number; z: number }, k: number) => { const i = Math.floor(((p.x - FIELD.minX) / FIELD.sx) * FIELD.w), j = Math.floor(((p.z - FIELD.minZ) / FIELD.sz) * FIELD.h); return f.data[(j * FIELD.w + i) * 4 + k] / 255 }
      let tall = 0, n = 0
      for (let x = -10; x <= 10; x += 2) for (const z of [SHORE.z - 1, SHORE.z + 1]) { tall += ch({ x, z }, 3); n++ }
      expect(tall / n).toBeGreaterThan(0.6)
      // the lane is grassy between rocky shoulders, and its grass grows longer the higher you climb
      const lane = (s0: number, s1: number, k: number) => { let a = 0, n = 0; for (let s = s0; s < s1; s += 1) { a += ch(NORTH.points[Math.round(s / NORTH.step)], k); n++ } return a / n }
      const L = NORTH.length
      expect(lane(startS + 5, startS + 25, 0)).toBeGreaterThan(0.5)
      expect(lane(L - 25, L - 5, 0)).toBeGreaterThan(0.5)
      expect(lane(L - 25, L - 5, 1)).toBeGreaterThan(lane(startS + 5, startS + 25, 1) + 0.2)
      const shoulder = (s: number) => { const q = NORTH.points[Math.round(s / NORTH.step)], i = Math.round(s / NORTH.step), n = NORTH.points[i + 1], l = Math.hypot(n.x - q.x, n.z - q.z), off = NORTH.halfWidth(s) + 1.6; return at({ x: q.x - ((n.z - q.z) / l) * off, z: q.z + ((n.x - q.x) / l) * off }) }
      let sh = 0, cnt = 0; for (let s = 50; s < L - 30; s += 3) { sh += shoulder(s); cnt++ }
      expect(sh / cnt).toBeLessThan(lane(50, L - 30, 0) * 0.8)
      let meadowG = 0, mn = 0; for (let x = -10; x <= 10; x += 2) { meadowG += ch({ x, z: SHORE.z }, 1); mn++ }
      expect(meadowG / mn).toBeGreaterThanOrEqual(lane(L - 25, L - 5, 1) - 0.02)   // longest by the lake
    })
  })
})
