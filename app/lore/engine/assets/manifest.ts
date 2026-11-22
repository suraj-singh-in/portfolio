/** Metadata for one baked scenery sprite (written by tools/lore/convert-sprites.mjs). */
export type SpriteMeta = {
  file: string
  w: number
  h: number
  /** pixels per metre of the bake */
  ppu: number
  /** pixel position of the asset's ground origin inside the image */
  anchor: [number, number]
  /** ground footprint radius in metres */
  foot: number
}

/** Paths of every runtime asset, relative to `base`. */
export const ASSETS = {
  base: '/lore',
  sprites: 'sprites/manifest.json',
  hero: 'models/hero.glb',
  /** animation-only rider clips authored on the hero's skeleton (tools/lore/ride_clips.py) */
  heroRide: 'models/hero_ride.glb',
  horse: 'models/horse.glb',
  ambience: 'audio/ambience.wav',
  step: 'audio/step.wav',
} as const

export const assetUrl = (path: string) => `${ASSETS.base}/${path}`
