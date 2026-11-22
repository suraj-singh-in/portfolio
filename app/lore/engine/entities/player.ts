import { CONFIG } from '../config'
import type { Circle, Vec2 } from '../core/types'
import { resolveCollisions } from '../world/clearing'
import { clampToWorld } from '../world/bounds'

export type PlayerState = {
  x: number; z: number
  /** Yaw in radians; 0 faces +z (toward the camera's bottom of screen), atan2(dx, dz) convention. */
  facing: number
  mode: 'free' | 'stroke'
  /** Time (s) at which the current stroke ends. */
  until: number
  moving: boolean
  running: boolean
}

export function createPlayer(): PlayerState {
  const { x, z } = CONFIG.PLAYER.start
  return { x, z, facing: Math.PI, mode: 'free', until: 0, moving: false, running: false }
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

export function updatePlayer(s: PlayerState, move: { x: number; z: number; run: boolean }, dt: number, t: number, obstacles: readonly Circle[]): PlayerState {
  let { x, z, facing, mode } = s
  if (mode === 'stroke' && t >= s.until) mode = 'free'
  const moving = mode === 'free' && (move.x !== 0 || move.z !== 0)
  const running = moving && move.run
  if (moving) {
    const speed = running ? CONFIG.PLAYER.run : CONFIG.PLAYER.walk
    x += move.x * speed * dt; z += move.z * speed * dt
    facing += wrap(Math.atan2(move.x, move.z) - facing) * Math.min(1, dt * 12)
  }
  let p: Vec2 = resolveCollisions({ x, z }, obstacles, CONFIG.PLAYER.radius)
  p = clampToWorld(p)
  return { x: p.x, z: p.z, facing, mode, until: s.until, moving, running }
}

/** Turn to face a point and start the stroke pose (movement locked while it plays). */
export function faceToward(s: PlayerState, target: Vec2, t: number): PlayerState {
  return { ...s, facing: Math.atan2(target.x - s.x, target.z - s.z), mode: 'stroke', until: t + CONFIG.PLAYER.strokeSecs, moving: false, running: false }
}
