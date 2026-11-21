import { CONFIG } from '../config'
import { mulberry32 } from '../core/rng'
import type { Circle } from '../core/types'
import { LAYOUT, edgeRadius } from './clearing'

export type Placed = { sprite: string; x: number; z: number; scale: number; sway: number }
export type Rock = Placed & { tufts: boolean; tuftCount: number }
export type World = { trees: Placed[]; undergrowth: Placed[]; rocks: Rock[]; obstacles: Circle[] }

const TREE_KINDS: readonly [string, number][] = [['fir_a', 3], ['fir_b', 3], ['fir_c', 3], ['pine_a', 2], ['pine_b', 2], ['pine_c', 1], ['oak', 2], ['oak_b', 2]]
const UNDER = ['fern_a', 'fern_b', 'fern_c', 'fern_d', 'shrub_a', 'shrub_b', 'shrub_c', 'shrub_d']
const ROCKS = ['rock_01', 'rock_02', 'rock_03', 'rock_04', 'rock_05', 'rock_06', 'rock_07', 'rock_09', 'rock_10', 'rock_11', 'rock_13']

/** Seeded placement of the forest ring, edge undergrowth and rocks around the fixed landmarks. */
export function scatterWorld(seed: number): World {
  const rand = mulberry32(seed)
  const sx = CONFIG.CLEARING.stretchX
  const placed: Circle[] = [
    { ...LAYOUT.hut, r: 3.4 }, { ...LAYOUT.fire, r: 1.2 }, { ...LAYOUT.horse, r: 2 },
    { ...LAYOUT.gnarled, r: 2.2 }, { ...LAYOUT.log, r: 1.3 },
  ]
  const free = (x: number, z: number, r: number) => !placed.some((p) => Math.hypot(p.x - x, p.z - z) < p.r + r)
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
    if (!free(x, z, 1.25)) continue
    placed.push({ x, z, r: 1.25 })
    trees.push({ sprite: pickTree(), x, z, scale: 0.85 + rand() * 0.3, sway: 0.012 + rand() * 0.01 })
  }

  const undergrowth: Placed[] = []
  for (let tries = 0; undergrowth.length < 200 && tries < 30000; tries++) {
    const a = rand() * Math.PI * 2, d = edgeRadius(a) + 0.4 + rand() * 7
    const x = Math.cos(a) * d * sx, z = Math.sin(a) * d
    if (!free(x, z, 0.6)) continue
    placed.push({ x, z, r: 0.6 })
    undergrowth.push({ sprite: UNDER[(rand() * UNDER.length) | 0], x, z, scale: 0.8 + rand() * 0.5, sway: 0.02 })
  }

  const rocks: Rock[] = []
  for (let tries = 0; rocks.length < 28 && tries < 5000; tries++) {
    const a = rand() * Math.PI * 2, d = 4 + rand() * (CONFIG.CLEARING.radius + 4)
    const x = Math.cos(a) * d * sx, z = Math.sin(a) * d
    if (!free(x, z, 0.9)) continue
    placed.push({ x, z, r: 0.9 })
    const scale = 0.6 + rand() * 0.6
    const tufts = rand() >= 0.5
    rocks.push({ sprite: ROCKS[(rand() * ROCKS.length) | 0], x, z, scale, sway: 0, tufts, tuftCount: tufts ? Math.round(150 + rand() * 450) : 0 })
    if (d < CONFIG.CLEARING.radius) obstacles.push({ x, z, r: 0.55 * scale })
  }

  return { trees, undergrowth, rocks, obstacles }
}
