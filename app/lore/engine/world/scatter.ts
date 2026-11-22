import { CONFIG } from '../config'
import { mulberry32 } from '../core/rng'
import type { Circle } from '../core/types'
import { LAYOUT, edgeRadius } from './clearing'
import { ROAD, STONE_WALL, WALL, wallLine, wallXAt } from './road'
import { inClearing } from './bounds'
import { NORTH, SHORE, inEllipse, inLake as lakeAt } from './north'
import { offTrack } from './track'

export type Placed = { sprite: string; x: number; z: number; scale: number; sway: number }
export type Rock = Placed & { tufts: boolean; tuftCount: number }
/** cliffs: rock walls standing beside the mountain track; flats: ground patches drawn beneath everything */
export type World = { trees: Placed[]; undergrowth: Placed[]; rocks: Rock[]; cliffs: Placed[]; flats: Placed[]; obstacles: Circle[] }

const TREE_KINDS: readonly [string, number][] = [['fir_a', 3], ['fir_b', 3], ['fir_c', 3], ['pine_a', 2], ['pine_b', 2], ['pine_c', 1], ['oak', 2], ['oak_b', 2]]
const UNDER = ['fern_a', 'fern_b', 'fern_c', 'fern_d', 'shrub_a', 'shrub_b', 'shrub_c', 'shrub_d']
const ROCKS = ['rock_01', 'rock_02', 'rock_03', 'rock_04', 'rock_05', 'rock_06', 'rock_07', 'rock_09', 'rock_10', 'rock_11', 'rock_13']

/** Spacing check over everything placed so far, bucketed in 4 m cells so a check only visits its neighbours. */
function spacingGrid(initial: Circle[]) {
  const CELL = 4, cells = new Map<number, Circle[]>()
  let maxR = 0
  const key = (i: number, j: number) => (i + 4096) * 8192 + (j + 4096)
  const push = (c: Circle) => {
    maxR = Math.max(maxR, c.r)
    const k = key(Math.floor(c.x / CELL), Math.floor(c.z / CELL))
    const list = cells.get(k); if (list) list.push(c); else cells.set(k, [c])
  }
  const free = (x: number, z: number, r: number) => {
    const reach = Math.ceil((r + maxR) / CELL), ci = Math.floor(x / CELL), cj = Math.floor(z / CELL)
    for (let i = ci - reach; i <= ci + reach; i++) for (let j = cj - reach; j <= cj + reach; j++) {
      const list = cells.get(key(i, j)); if (!list) continue
      for (const p of list) if (Math.hypot(p.x - x, p.z - z) < p.r + r) return false
    }
    return true
  }
  initial.forEach(push)
  return { push, free }
}

/** Seeded placement of the forest ring, edge undergrowth and rocks around the fixed landmarks. */
export function scatterWorld(seed: number): World {
  const rand = mulberry32(seed)
  const sx = CONFIG.CLEARING.stretchX
  const placed = spacingGrid([
    { ...LAYOUT.hut, r: 3.4 }, { ...LAYOUT.fire, r: 1.2 }, { ...LAYOUT.horse, r: 2 },
    { ...LAYOUT.gnarled, r: 2.2 }, { ...LAYOUT.log, r: 1.3 },
  ])
  /** distance outside the shore ellipse, roughly in metres (negative = on it) */
  const offShore = (x: number, z: number) => (Math.hypot((x - SHORE.x) / SHORE.rx, (z - SHORE.z) / SHORE.rz) - 1) * Math.min(SHORE.rx, SHORE.rz)
  /** distance outside the nearest track or shore edge (negative = on walkable ground beyond the clearing) */
  const offRoad = (x: number, z: number) => Math.min(offTrack(ROAD, { x, z }), offTrack(NORTH, { x, z }), offShore(x, z))
  const inLake = (x: number, z: number, pad = 0) => lakeAt({ x, z }, pad)
  const free = placed.free
  const pickTree = () => {
    let r = rand() * TREE_KINDS.reduce((s, [, w]) => s + w, 0)
    for (const [n, w] of TREE_KINDS) if ((r -= w) <= 0) return n
    return TREE_KINDS[0][0]
  }
  const obstacles: Circle[] = [
    { ...LAYOUT.hut, r: 2.6 }, { ...LAYOUT.fire, r: 0.85 }, { ...LAYOUT.horse, r: 1.35 },
    { ...LAYOUT.gnarled, r: 0.9 }, { ...LAYOUT.log, r: 0.9 },
  ]

  const trees: Placed[] = []
  for (let tries = 0; trees.length < 340 && tries < 40000; tries++) {
    const a = rand() * Math.PI * 2, d = edgeRadius(a) + 1.2 + Math.pow(rand(), 0.8) * 22
    const x = Math.cos(a) * d * sx, z = Math.sin(a) * d
    if (offRoad(x, z) < 1.2 || !free(x, z, 1.25)) continue
    placed.push({ x, z, r: 1.25 })
    trees.push({ sprite: pickTree(), x, z, scale: 0.85 + rand() * 0.3, sway: 0.012 + rand() * 0.01 })
  }

  const undergrowth: Placed[] = []
  for (let tries = 0; undergrowth.length < 200 && tries < 30000; tries++) {
    const a = rand() * Math.PI * 2, d = edgeRadius(a) + 0.4 + rand() * 7
    const x = Math.cos(a) * d * sx, z = Math.sin(a) * d
    if (offRoad(x, z) < 0.3 || !free(x, z, 0.6)) continue
    placed.push({ x, z, r: 0.6 })
    undergrowth.push({ sprite: UNDER[(rand() * UNDER.length) | 0], x, z, scale: 0.8 + rand() * 0.5, sway: 0.02 })
  }

  const rocks: Rock[] = []
  for (let tries = 0; rocks.length < 28 && tries < 5000; tries++) {
    const a = rand() * Math.PI * 2, d = 4 + rand() * (CONFIG.CLEARING.radius + 4)
    const x = Math.cos(a) * d * sx, z = Math.sin(a) * d
    if (offRoad(x, z) < 0.5 || !free(x, z, 0.9)) continue
    placed.push({ x, z, r: 0.9 })
    const scale = 0.6 + rand() * 0.6
    const tufts = rand() >= 0.5
    rocks.push({ sprite: ROCKS[(rand() * ROCKS.length) | 0], x, z, scale, sway: 0, tufts, tuftCount: tufts ? Math.round(150 + rand() * 450) : 0 })
    if (d < CONFIG.CLEARING.radius) obstacles.push({ x, z, r: 0.55 * scale })
  }

  // ---------- the east road: forest on both sides, thinning over the last stretch before the town wall ----------
  const pointAt = (s: number) => ROAD.points[Math.max(0, Math.min(ROAD.points.length - 1, Math.round(s / ROAD.step)))]
  /** forest density by distance to the town wall: open ground in front of it, full forest ~45 m back */
  const thin = (x: number, z: number) => { const k = Math.min(1, Math.max(0, (Math.hypot(x - WALL.x, z - WALL.z) - 4) / 41)); return 0.05 + 0.95 * k * k }
  const besideRoad = (s: number, off: number) => {
    const i = Math.max(0, Math.min(ROAD.points.length - 2, Math.round(s / ROAD.step)))
    const a = ROAD.points[i], b = ROAD.points[i + 1], l = Math.hypot(b.x - a.x, b.z - a.z) || 1
    const p = pointAt(s)
    return { x: p.x + (-(b.z - a.z) / l) * off, z: p.z + ((b.x - a.x) / l) * off }
  }
  // keep the walls and the paved path behind the gate clear of trees
  const wallZone = (x: number, z: number) => (Math.abs(z - WALL.z) < WALL.half + 2.5 && x > wallXAt(z) - 4)
    || (Math.abs(z - STONE_WALL.z) < 3 && x > STONE_WALL.x0 - 1.5 && x < STONE_WALL.x1 + 1.5)
  for (let tries = 0, made = 0; made < 700 && tries < 40000; tries++) {
    const s = rand() * (ROAD.length + 6), side = rand() < 0.5 ? -1 : 1
    const off = ROAD.halfWidth(Math.min(s, ROAD.length)) + 1.1 + Math.pow(rand(), 1.6) * 11   // crowded close to the track, like a jungle road
    const { x, z } = besideRoad(Math.min(s, ROAD.length), side * off)
    if (inClearing({ x: x / 1.08, z: z / 1.08 }) || wallZone(x, z)) continue
    const r = 0.75 / Math.sqrt(thin(x, z))   // jungle-tight; wider gaps near the wall (sampling until full would otherwise refill it)
    if (offRoad(x, z) < 1.2 || !free(x, z, r)) continue
    placed.push({ x, z, r }); made++
    trees.push({ sprite: pickTree(), x, z, scale: 0.85 + rand() * 0.3, sway: 0.012 + rand() * 0.01 })
  }
  for (let tries = 0, made = 0; made < 150 && tries < 20000; tries++) {
    const s = rand() * ROAD.length, side = rand() < 0.5 ? -1 : 1
    const { x, z } = besideRoad(s, side * (ROAD.halfWidth(s) + 0.4 + rand() * 3.2))
    if (inClearing({ x: x / 1.04, z: z / 1.04 }) || wallZone(x, z)) continue
    const r = 0.6 / Math.sqrt(thin(x, z))
    if (offRoad(x, z) < 0.3 || !free(x, z, r)) continue
    placed.push({ x, z, r }); made++
    undergrowth.push({ sprite: UNDER[(rand() * UNDER.length) | 0], x, z, scale: 0.7 + rand() * 0.5, sway: 0.02 })
  }
  // little stones along the verges (a few out in the track); scenery only, never blocking
  for (let tries = 0, made = 0; made < 70 && tries < 8000; tries++) {
    const s = rand() * ROAD.length, middle = rand() < 0.1
    const off = middle ? (rand() - 0.5) * 2 : (rand() < 0.5 ? -1 : 1) * (ROAD.halfWidth(s) + (rand() - 0.5) * 1.2)
    const { x, z } = besideRoad(s, off)
    if (inClearing({ x, z }) || !free(x, z, 0.3)) continue
    placed.push({ x, z, r: 0.3 }); made++
    rocks.push({ sprite: ROCKS[(rand() * ROCKS.length) | 0], x, z, scale: 0.16 + rand() * 0.18, sway: 0, tufts: false, tuftCount: 0 })
  }
  // the town wall closes the road
  for (const p of wallLine(0.9)) obstacles.push({ x: p.x, z: p.z, r: 0.7 })

  // ---------- the north mountain track: cliffs up the climb, boulders and scree, a few pines low down ----------
  const cliffs: Placed[] = [], flats: Placed[] = []
  const nq = (s: number) => {
    const i = Math.max(0, Math.min(NORTH.points.length - 2, Math.round(s / NORTH.step)))
    const a = NORTH.points[i], b = NORTH.points[i + 1], l = Math.hypot(b.x - a.x, b.z - a.z) || 1
    return { p: NORTH.points[i], n: { x: -(b.z - a.z) / l, z: (b.x - a.x) / l } }
  }
  const beside = (s: number, off: number) => { const { p, n } = nq(s); return { x: p.x + n.x * off, z: p.z + n.z * off } }
  const sStart = NORTH.points.findIndex((p) => !inClearing(p)) * NORTH.step
  const sFoot = NORTH.points.findIndex((p) => p.z < -33) * NORTH.step
  const CLIFFS = ['cliff_a', 'cliff_b', 'cliff_c']
  const BOULDERS = ['boulder_a', 'boulder_b', 'boulder_c', 'boulder_d']
  // boulders shoulder to shoulder along both edges of the climb: the way shows itself between them
  for (let s = sStart; s < NORTH.length; s += 1.25) for (const side of [-1, 1]) {
    const { x, z } = beside(s + (rand() - 0.5) * 0.5, side * (NORTH.halfWidth(s) + 0.25 + rand() * 0.55))
    if (inClearing({ x, z }) || inEllipse({ x, z }, SHORE) || inLake(x, z, 0.5) || !free(x, z, 0.42)) continue
    placed.push({ x, z, r: 0.42 })
    rocks.push({ sprite: BOULDERS[(rand() * 4) | 0], x, z, scale: 0.38 + rand() * 0.32, sway: 0, tufts: false, tuftCount: 0 })
  }
  // cliff walls rise on the uphill (north, far) side of each leg; the downhill side — between you and the
  // camera — gets only low boulders, so the rock frames the climb without hiding the track below it
  for (let s = sStart; s < NORTH.length; s += 0.8) for (const side of [-1, 1]) {
    const uphill = nq(s).n.z * side < 0
    if (rand() > (s < sFoot ? 0.08 : uphill ? 0.6 : 0.25)) continue
    const { x, z } = beside(s, side * (NORTH.halfWidth(s) + (uphill ? 2 : 1) + rand() * 1.2))
    if (inClearing({ x, z }) || offRoad(x, z) < (uphill ? 1.0 : 0.4) || inLake(x, z, 1) || !free(x, z, uphill ? 1.3 : 0.8)) continue
    placed.push({ x, z, r: uphill ? 1.3 : 0.8 })
    if (uphill) cliffs.push({ sprite: CLIFFS[(rand() * CLIFFS.length) | 0], x, z, scale: 0.5 + rand() * 0.25, sway: 0 })
    else rocks.push({ sprite: ['boulder_b', 'boulder_d', 'scree_a'][(rand() * 3) | 0], x, z, scale: 0.35 + rand() * 0.3, sway: 0, tufts: false, tuftCount: 0 })
  }
  // long cliffs framing the shore, running along the waterline
  for (const side of [-1, 1]) {
    const x = SHORE.x + side * (SHORE.rx + 7.5), z = SHORE.z - 1
    placed.push({ x, z, r: 4 }); cliffs.push({ sprite: side < 0 ? 'cliff_long' : 'cliff_long2', x, z, scale: 0.6, sway: 0 })
  }
  // boulders that stand in the broad foothills (you walk around them) — never more than a third of the width
  for (let tries = 0, made = 0; made < 2 && tries < 400; tries++) {
    const s = sStart + 2 + rand() * (sFoot - sStart - 4), hw = NORTH.halfWidth(s)
    const { x, z } = beside(s, (rand() < 0.5 ? -1 : 1) * (hw * (0.3 + rand() * 0.45)))
    const scale = 0.35 + rand() * 0.2, r = 0.55 * scale   // knee-high stones, not walls
    if (!free(x, z, 1.4)) continue
    placed.push({ x, z, r: 1.4 }); made++
    rocks.push({ sprite: ['boulder_a', 'boulder_c', 'boulder_d'][(rand() * 3) | 0], x, z, scale, sway: 0, tufts: false, tuftCount: 0 })
    obstacles.push({ x, z, r })
  }
  // loose scree and pebbles on the track itself: underfoot, never blocking
  for (let tries = 0, made = 0; made < 60 && tries < 3000; tries++) {
    const s = sStart + rand() * (NORTH.length - sStart)
    const { x, z } = beside(s, (rand() < 0.5 ? -1 : 1) * NORTH.halfWidth(s) * (0.72 + rand() * 0.24))   // on the lane's shoulders, not its middle
    if (offTrack(NORTH, { x, z }) > 0 || !free(x, z, 0.25)) continue
    placed.push({ x, z, r: 0.25 }); made++
    rocks.push({ sprite: rand() < 0.5 ? 'scree_a' : 'pebbles_a', x, z, scale: 0.45 + rand() * 0.3, sway: 0, tufts: false, tuftCount: 0 })
  }
  // a few pines low on the climb, thinning out as it rises
  for (let tries = 0, made = 0; made < 40 && tries < 4000; tries++) {
    const s = sStart + rand() * (sFoot + 15 - sStart), side = rand() < 0.5 ? -1 : 1
    if (rand() > 1 - (s - sStart) / (sFoot + 20 - sStart)) continue
    const { x, z } = beside(s, side * (NORTH.halfWidth(s) + 1.6 + rand() * 12))
    if (inClearing({ x: x / 1.08, z: z / 1.08 }) || offRoad(x, z) < 1.2 || !free(x, z, 1.1)) continue
    placed.push({ x, z, r: 1.1 }); made++
    trees.push({ sprite: rand() < 0.5 ? 'pine_a' : rand() < 0.5 ? 'fir_c' : 'pine_b', x, z, scale: 0.7 + rand() * 0.3, sway: 0.012 })
  }
  // ferns and shrubs ringing the lakeside meadow (and a few out in it), leaving the middle open
  for (let tries = 0, made = 0; made < 26 && tries < 2000; tries++) {
    const a = rand() * Math.PI * 2, k = made < 20 ? 1 + rand() * 0.3 : 0.6 + rand() * 0.35
    const x = SHORE.x + Math.cos(a) * SHORE.rx * k, z = SHORE.z + Math.sin(a) * SHORE.rz * k
    if (inLake(x, z, 0.4) || offTrack(NORTH, { x, z }) < 0.3 || !free(x, z, 0.55)) continue
    placed.push({ x, z, r: 0.55 }); made++
    undergrowth.push({ sprite: UNDER[(rand() * UNDER.length) | 0], x, z, scale: 0.8 + rand() * 0.5, sway: 0.02 })
  }

  return { trees, undergrowth, rocks, cliffs, flats, obstacles }
}
