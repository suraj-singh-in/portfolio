import { CONFIG } from '../config'
import type { Vec2 } from '../core/types'

export type HorseClip = 'Eating' | 'Idle' | 'Idle_Headlow' | 'Idle_2' | 'Idle_HitReact_Left' | 'Idle_HitReact_Right'
export type Side = 'left' | 'right'
/** length of the reaction clip (16 frames at 24 fps) */
const REACT_SECS = 0.67
export type HorseMode = 'graze' | 'alert' | 'stroked'
export type HorseState = { mode: HorseMode; clip: HorseClip; nextSwitch: number; until: number; reactUntil: number }

export function createHorse(): HorseState {
  return { mode: 'graze', clip: 'Eating', nextSwitch: 0, until: 0, reactUntil: 0 }
}

/** graze ↔ alert by player distance (with hysteresis), stroked for a fixed time after E. */
export function updateHorse(s: HorseState, playerDist: number, t: number, rand: () => number): HorseState {
  const H = CONFIG.HORSE
  let { mode, clip, nextSwitch } = s
  if (mode === 'stroked') {
    if (t < s.until) return t < s.reactUntil ? s : { ...s, clip: 'Idle' }
    mode = 'alert'
  }
  if (playerDist < H.alert) { mode = 'alert'; clip = 'Idle' }
  else if (mode === 'alert' && playerDist > H.calm) { mode = 'graze'; nextSwitch = t }
  if (mode === 'graze' && t >= nextSwitch) {
    const r = rand()
    clip = r < 0.6 ? 'Eating' : r < 0.85 ? 'Idle_Headlow' : 'Idle_2'
    nextSwitch = t + H.grazeSwitch[0] + rand() * (H.grazeSwitch[1] - H.grazeSwitch[0])
  }
  return { mode, clip, nextSwitch, until: s.until, reactUntil: s.reactUntil }
}

/** E near the horse: it flinches toward the side you touched it on, then calms. */
export function strokeHorse(s: HorseState, t: number, side: Side): HorseState {
  return { ...s, mode: 'stroked', clip: side === 'left' ? 'Idle_HitReact_Left' : 'Idle_HitReact_Right', until: t + CONFIG.HORSE.strokeSecs, reactUntil: t + REACT_SECS }
}

/** Which side of the horse the player is on (horse faces horseFacing; +x is its left when facing +z). */
export function reactionSide(horseFacing: number, horse: Vec2, player: Vec2): Side {
  const a = Math.atan2(player.x - horse.x, player.z - horse.z) - horseFacing
  return Math.sin(a) >= 0 ? 'left' : 'right'
}

/** Neck/head yaw toward the player relative to the horse's facing; 0 while grazing. */
export function horseLookAngle(horseFacing: number, horse: Vec2, player: Vec2, mode: HorseMode): number {
  if (mode === 'graze') return 0
  const a = Math.atan2(player.x - horse.x, player.z - horse.z) - horseFacing
  const w = Math.atan2(Math.sin(a), Math.cos(a))
  return Math.max(-CONFIG.HORSE.lookClamp, Math.min(CONFIG.HORSE.lookClamp, w))
}
