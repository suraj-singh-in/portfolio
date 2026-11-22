import * as THREE from 'three'

/** Brightness ramp, light → dense ink. Index 0 is blank. */
export const RAMP = ' .,:;-~=+*ox#%@'
/** Edge glyphs used where the silhouette or a fold has a clear direction. */
export const EDGES = '|/-\\'
export const GLYPHS = RAMP + EDGES

export type GlyphAtlas = { texture: THREE.Texture; nRamp: number; nTotal: number }

/** One-row texture atlas of every glyph, white on transparent (alpha is the coverage). */
export function createGlyphAtlas(): GlyphAtlas {
  const gw = 48, gh = 72
  const c = document.createElement('canvas')
  c.width = gw * GLYPHS.length; c.height = gh
  const g = c.getContext('2d')!
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.font = '700 60px Consolas, Menlo, "DejaVu Sans Mono", monospace'
  ;[...GLYPHS].forEach((ch, i) => g.fillText(ch, i * gw + gw / 2, gh / 2 + 3))
  const texture = new THREE.CanvasTexture(c)
  texture.anisotropy = 4
  texture.colorSpace = THREE.NoColorSpace
  return { texture, nRamp: RAMP.length, nTotal: GLYPHS.length }
}
