import { CONFIG } from '../config'
import type { Circle, Vec2 } from '../core/types'

/** Hand-placed landmarks of the clearing (world metres). */
export const LAYOUT = {
  hut: { x: -6.2, z: -5.2 },
  fire: { x: -1.6, z: 0.6 },
  horse: { x: 5.8, z: -2.6 },
  log: { x: -3.4, z: 3.6 },
  gnarled: { x: 9.5, z: 5.5 },
} as const satisfies Record<string, Vec2>

/** Clearing radius at an angle measured on the x/stretchX plane: an irregular, organic edge. */
export function edgeRadius(angle: number): number {
  let k = 1
  for (const [f, p, amp] of CONFIG.CLEARING.wobble) k += amp * Math.sin(f * angle + p)
  return CONFIG.CLEARING.radius * k
}

/** Pull a point back onto the clearing edge if it is outside. */
export function clampToClearing(p: Vec2): Vec2 {
  const sx = p.x / CONFIG.CLEARING.stretchX
  const d = Math.hypot(sx, p.z)
  const er = edgeRadius(Math.atan2(p.z, sx))
  if (d <= er) return p
  const k = er / d
  return { x: p.x * k, z: p.z * k }
}

/** Push a point of the given radius out of every circle it overlaps. */
export function resolveCollisions(p: Vec2, obstacles: readonly Circle[], radius: number): Vec2 {
  let { x, z } = p
  for (const o of obstacles) {
    const dx = x - o.x, dz = z - o.z
    const d = Math.hypot(dx, dz) || 1e-4
    const min = o.r + radius
    if (d < min) { x = o.x + (dx / d) * min; z = o.z + (dz / d) * min }
  }
  return { x, z }
}
