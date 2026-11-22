import { CONFIG } from '../config'
import type { Circle, Vec2 } from '../core/types'
import { resolveCollisions } from '../world/clearing'
import { clampToWorld } from '../world/bounds'

export type RidePhase = 'onFoot' | 'mounting' | 'riding' | 'dismounting'

/** The horse's ride state. x/z/facing are the horse's; the rider follows while not on foot. */
export type RideState = {
  phase: RidePhase
  /** time (s) the current mount/dismount ends */
  until: number
  x: number
  z: number
  /** yaw, atan2(dx, dz) convention (0 faces +z) */
  facing: number
  /** ground speed m/s */
  speed: number
  galloping: boolean
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

export function createRide(horse: Vec2, facing: number): RideState {
  return { phase: 'onFoot', until: 0, x: horse.x, z: horse.z, facing, speed: 0, galloping: false }
}

/** E: on foot within range → start mounting; riding → start dismounting; mid-transition → ignored. */
export function toggleMount(s: RideState, player: Vec2, t: number): RideState {
  const R = CONFIG.RIDE
  if (s.phase === 'onFoot' && Math.hypot(player.x - s.x, player.z - s.z) < CONFIG.HORSE.interact)
    return { ...s, phase: 'mounting', until: t + R.mountSecs, speed: 0 }
  if (s.phase === 'riding') return { ...s, phase: 'dismounting', until: t + R.dismountSecs, speed: 0, galloping: false }
  return s
}

export function updateRide(s: RideState, move: { x: number; z: number; run: boolean }, dt: number, t: number, obstacles: readonly Circle[]): RideState {
  const R = CONFIG.RIDE
  if (s.phase === 'mounting') return t >= s.until ? { ...s, phase: 'riding' } : s
  if (s.phase === 'dismounting') return t >= s.until ? { ...s, phase: 'onFoot' } : s
  if (s.phase !== 'riding') return s

  const steering = move.x !== 0 || move.z !== 0
  let facing = s.facing
  if (steering) {
    const turn = wrap(Math.atan2(move.x, move.z) - facing)
    facing = wrap(facing + Math.max(-R.turnRate * dt, Math.min(R.turnRate * dt, turn)))
  }
  const target = steering ? (move.run ? R.gallop : R.walk) : 0
  const speed = s.speed + Math.max(-R.accel * dt, Math.min(R.accel * dt, target - s.speed))
  let p: Vec2 = { x: s.x + Math.sin(facing) * speed * dt, z: s.z + Math.cos(facing) * speed * dt }
  p = clampToWorld(resolveCollisions(p, obstacles, R.radius))
  return { ...s, x: p.x, z: p.z, facing, speed, galloping: speed > (R.walk + R.gallop) / 2 }
}

/** Where the rider stands to mount / lands on dismount: the horse's left side, never inside an obstacle. */
export function sidePoint(s: RideState, obstacles: readonly Circle[], side: 'left' | 'right' = 'left'): Vec2 {
  const r = CONFIG.PLAYER.radius
  const clear = (p: Vec2) => obstacles.every((o) => Math.hypot(p.x - o.x, p.z - o.z) >= o.r + r - 1e-9)
  const settle = (dir: Vec2) => {
    let p: Vec2 = { x: s.x + dir.x * CONFIG.RIDE.sideOffset, z: s.z + dir.z * CONFIG.RIDE.sideOffset }
    for (let pass = 0; pass < 4; pass++) {          // repeat: pushing out of one circle can push into another
      for (const o of obstacles) {
        const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz)
        if (d >= o.r + r) continue
        const [ux, uz] = d > 1e-6 ? [dx / d, dz / d] : [dir.x, dir.z]   // dead centre: push further out this way
        p = { x: o.x + ux * (o.r + r), z: o.z + uz * (o.r + r) }
      }
      p = clampToWorld(p)
      if (clear(p)) return p
    }
    return null
  }
  const f = s.facing
  // the asked side first, then the other side, rear, front — the first spot clear of everything inside the clearing
  const left = { x: Math.cos(f), z: -Math.sin(f) }, right = { x: -left.x, z: -left.z }
  const dirs: Vec2[] = [side === 'left' ? left : right, side === 'left' ? right : left, { x: -Math.sin(f), z: -Math.cos(f) }, { x: Math.sin(f), z: Math.cos(f) }]
  for (const d of dirs) { const p = settle(d); if (p) return p }
  return clampToWorld({ x: s.x + dirs[0].x * CONFIG.RIDE.sideOffset, z: s.z + dirs[0].z * CONFIG.RIDE.sideOffset })
}
