import type { GlyphOpts } from './glyphMaterial'

/** Cache key for a baked sprite. Wind sway is applied at draw time, so it must not split the cache. */
export function bakeKey(name: string, scale: number, cell: [number, number], opts: Partial<GlyphOpts>): string {
  return JSON.stringify([name, Math.round(scale * 10) / 10, cell, { ...opts, sway: 0 }])
}
