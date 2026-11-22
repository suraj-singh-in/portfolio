import { CONFIG } from '../config'
import type { Vec2 } from '../core/types'
import { clampToClearing, edgeRadius } from './clearing'
import { NORTH, SHORE, inEllipse, toEllipseEdge } from './north'
import { ROAD } from './road'
import { offTrack, toTrackEdge } from './track'

export const inClearing = (p: Vec2) => {
  const sx = p.x / CONFIG.CLEARING.stretchX
  return Math.hypot(sx, p.z) <= edgeRadius(Math.atan2(p.z, sx))
}

/** Is this ground walkable: the clearing, the east road, the north track or the lake shore. */
export const walkable = (p: Vec2) => inClearing(p) || offTrack(ROAD, p) <= 0 || offTrack(NORTH, p) <= 0 || inEllipse(p, SHORE)

/** Keep a point on walkable ground: anything outside is pulled to the nearest edge of any area. */
export function clampToWorld(p: Vec2): Vec2 {
  if (walkable(p)) return p
  let best = clampToClearing(p), bd = Math.hypot(p.x - best.x, p.z - best.z)
  for (const c of [toTrackEdge(ROAD, p), toTrackEdge(NORTH, p), toEllipseEdge(p, SHORE)]) {
    const d = Math.hypot(p.x - c.x, p.z - c.z)
    if (d < bd) { best = c; bd = d }
  }
  return best
}
