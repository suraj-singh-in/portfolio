import { CONFIG } from '../config'
import type { Circle, Vec2 } from '../core/types'
import { clampToClearing, resolveCollisions } from '../world/clearing'

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
  p = clampToClearing(resolveCollisions(p, obstacles, R.radius))
  return { ...s, x: p.x, z: p.z, facing, speed, galloping: speed > (R.walk + R.gallop) / 2 }
}

/** Where the rider stands to mount / lands on dismount: the horse's left side, never inside an obstacle. */
export function sidePoint(s: RideState, obstacles: readonly Circle[]): Vec2 {
  const left = { x: Math.cos(s.facing), z: -Math.sin(s.facing) }
  let p: Vec2 = { x: s.x + left.x * CONFIG.RIDE.sideOffset, z: s.z + left.z * CONFIG.RIDE.sideOffset }
  const r = CONFIG.PLAYER.radius
  for (const o of obstacles) {
    const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz)
    if (d >= o.r + r) continue
    const [ux, uz] = d > 1e-6 ? [dx / d, dz / d] : [left.x, left.z]   // dead centre: push further out to the left
    p = { x: o.x + ux * (o.r + r), z: o.z + uz * (o.r + r) }
  }
  return clampToClearing(p)
}
