/** Seeded PRNG (mulberry32). Returns a function producing values in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hash = (x: number, z: number): number => {
  const v = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return v - Math.floor(v)
}

/** Smooth 2D value noise in [0, 1]. */
export function valueNoise(x: number, z: number): number {
  const xi = Math.floor(x), zi = Math.floor(z)
  const xf = x - xi, zf = z - zi
  const u = xf * xf * (3 - 2 * xf), w = zf * zf * (3 - 2 * zf)
  const a = hash(xi, zi) * (1 - u) + hash(xi + 1, zi) * u
  const b = hash(xi, zi + 1) * (1 - u) + hash(xi + 1, zi + 1) * u
  return a * (1 - w) + b * w
}

/** Three-octave fractal noise in [0, 1] (same weights as the prototype). */
export function fbm(x: number, z: number): number {
  return valueNoise(x, z) * 0.6 + valueNoise(x * 2.3 + 7, z * 2.3 + 3) * 0.3 + valueNoise(x * 5.1 + 1, z * 5.1 + 9) * 0.1
}
