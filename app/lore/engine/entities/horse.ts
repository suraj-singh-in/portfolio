import { CONFIG } from '../config'
import type { Vec2 } from '../core/types'

export type HorseClip = 'Eating' | 'Idle' | 'Idle_Headlow' | 'Idle_2'
export type HorseMode = 'graze' | 'alert' | 'stroked'
export type HorseState = { mode: HorseMode; clip: HorseClip; nextSwitch: number; until: number }

export function createHorse(): HorseState {
  return { mode: 'graze', clip: 'Eating', nextSwitch: 0, until: 0 }
}

/** graze ↔ alert by player distance (with hysteresis), stroked for a fixed time after E. */
export function updateHorse(s: HorseState, playerDist: number, t: number, rand: () => number): HorseState {
  const H = CONFIG.HORSE
  let { mode, clip, nextSwitch } = s
  if (mode === 'stroked') {
    if (t < s.until) return s
    mode = 'alert'
  }
  if (playerDist < H.alert) { mode = 'alert'; clip = 'Idle' }
  else if (mode === 'alert' && playerDist > H.calm) { mode = 'graze'; nextSwitch = t }
  if (mode === 'graze' && t >= nextSwitch) {
    const r = rand()
    clip = r < 0.6 ? 'Eating' : r < 0.85 ? 'Idle_Headlow' : 'Idle_2'
    nextSwitch = t + H.grazeSwitch[0] + rand() * (H.grazeSwitch[1] - H.grazeSwitch[0])
  }
  return { mode, clip, nextSwitch, until: s.until }
}

export function strokeHorse(s: HorseState, t: number): HorseState {
  return { ...s, mode: 'stroked', clip: 'Idle', until: t + CONFIG.HORSE.strokeSecs }
}

/** Neck/head yaw toward the player relative to the horse's facing; 0 while grazing. */
export function horseLookAngle(horseFacing: number, horse: Vec2, player: Vec2, mode: HorseMode): number {
  if (mode === 'graze') return 0
  const a = Math.atan2(player.x - horse.x, player.z - horse.z) - horseFacing
  const w = Math.atan2(Math.sin(a), Math.cos(a))
  return Math.max(-CONFIG.HORSE.lookClamp, Math.min(CONFIG.HORSE.lookClamp, w))
}
