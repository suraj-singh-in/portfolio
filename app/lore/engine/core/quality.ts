import { CONFIG } from '../config'

export type QualityTier = { name: 'high' | 'medium' | 'low'; grass: number }

const TIERS: Record<QualityTier['name'], QualityTier> = {
  high: { name: 'high', grass: CONFIG.GRASS_COUNT },
  medium: { name: 'medium', grass: CONFIG.GRASS_COUNT / 2 },
  low: { name: 'low', grass: CONFIG.GRASS_COUNT / 4 },
}

/** Integrated / mobile-class GPUs that should not get the full grass count by default. */
const INTEGRATED = /intel|uhd|iris|hd graphics|radeon\(tm\) graphics|radeon vega|mali|adreno|powervr|apple gpu|swiftshader|llvmpipe/i

/**
 * Pick a quality tier from the GPU renderer string and a short frame-time probe.
 * Tiers only change counts, never the look. `override` ('high'|'medium'|'low', from ?quality=) wins.
 */
export function pickTier(probe: { renderer: string; frameMs: number }, override?: string | null): QualityTier {
  if (override && override in TIERS) return TIERS[override as QualityTier['name']]
  if (probe.frameMs > 17.5) return TIERS.low       // below ~57 fps: target is 60
  if (probe.frameMs > 11 || INTEGRATED.test(probe.renderer)) return TIERS.medium
  return TIERS.high
}
