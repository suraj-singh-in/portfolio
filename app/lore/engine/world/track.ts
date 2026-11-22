import type { Vec2 } from '../core/types'

/** A walkable track: a smooth centre line through control points, with a half-width that varies along it. */
export type Track = {
  /** centre line resampled every `step` metres */
  points: readonly Vec2[]
  step: number
  length: number
  /** walkable half-width (m) at arc length s */
  halfWidth: (s: number) => number
  /** nearest point on the centre line: distance d, arc length s, the point and the left-hand normal there */
  query(p: Vec2): TrackHit
}
export type TrackHit = { d: number; s: number; at: Vec2; normal: Vec2 }

function catmull(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number): Vec2 {
  const t2 = t * t, t3 = t2 * t
  const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
  return { x: f(p0.x, p1.x, p2.x, p3.x), z: f(p0.z, p1.z, p2.z, p3.z) }
}

function centreline(control: readonly Vec2[], step: number): Vec2[] {
  const fine: Vec2[] = []
  for (let i = 0; i < control.length - 1; i++) {
    const p0 = control[Math.max(0, i - 1)], p1 = control[i], p2 = control[i + 1], p3 = control[Math.min(control.length - 1, i + 2)]
    for (let k = 0; k < 40; k++) fine.push(catmull(p0, p1, p2, p3, k / 40))
  }
  fine.push(control[control.length - 1])
  // resample at an even step along the curve
  const out: Vec2[] = [fine[0]]
  let carry = 0
  for (let i = 1; i < fine.length; i++) {
    const a = fine[i - 1], b = fine[i], seg = Math.hypot(b.x - a.x, b.z - a.z)
    let along = step - carry
    while (along <= seg) { const k = along / seg; out.push({ x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k }); along += step }
    carry = seg - (along - step)
  }
  const last = fine[fine.length - 1], tail = out[out.length - 1]
  if (Math.hypot(last.x - tail.x, last.z - tail.z) > 0.25) out.push(last)
  return out
}

export function makeTrack(control: readonly Vec2[], halfWidth: (s: number) => number, step = 1): Track {
  const points = centreline(control, step)
  return {
    points, step, length: (points.length - 1) * step, halfWidth,
    query(p) {
      let best: TrackHit = { d: Infinity, s: 0, at: points[0], normal: { x: 0, z: 1 } }
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i], b = points[i + 1]
        const ex = b.x - a.x, ez = b.z - a.z, len2 = ex * ex + ez * ez
        const k = Math.max(0, Math.min(1, ((p.x - a.x) * ex + (p.z - a.z) * ez) / len2))
        const at = { x: a.x + ex * k, z: a.z + ez * k }, d = Math.hypot(p.x - at.x, p.z - at.z)
        if (d < best.d) { const l = Math.sqrt(len2); best = { d, s: (i + k) * step, at, normal: { x: -ez / l, z: ex / l } } }
      }
      return best
    },
  }
}

/** Distance outside the track's edge (negative = on the track). */
export const offTrack = (t: Track, p: Vec2) => { const q = t.query(p); return q.d - t.halfWidth(q.s) }

/** Pull a point outside the track onto its nearest edge. */
export function toTrackEdge(t: Track, p: Vec2): Vec2 {
  const q = t.query(p), hw = t.halfWidth(q.s)
  if (q.d <= hw) return p
  return { x: q.at.x + ((p.x - q.at.x) * hw) / q.d, z: q.at.z + ((p.z - q.at.z) * hw) / q.d }
}
