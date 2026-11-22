import { CONFIG } from '../config'
import type { Vec2 } from '../core/types'

/** Is the player close enough to the horse to stroke it? */
export const inStrokeRange = (player: Vec2, horse: Vec2) => Math.hypot(player.x - horse.x, player.z - horse.z) < CONFIG.HORSE.interact

/** The point on the horse's neck the player reaches for (a little ahead of its centre). */
export const neckPoint = (horse: Vec2, facing: number): Vec2 => ({ x: horse.x + Math.sin(facing) * 0.7, z: horse.z + Math.cos(facing) * 0.7 })

/** Cycles through the stroke captions. */
export function createCaptions() {
  let i = 0
  return { next: () => CONFIG.CAPTIONS[i++ % CONFIG.CAPTIONS.length] }
}
