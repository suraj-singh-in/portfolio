import * as THREE from 'three'
import { CONFIG } from '../config'

export type TrampleBounds = { minX: number; minZ: number; sx: number; sz: number; w: number; h: number }

export type Trample = {
  /** press grass at (x, z): direction (dx, dz), strength, radius in metres */
  stamp(x: number, z: number, dx: number, dz: number, strength: number, radius: number): void
  /** recover pressed grass and upload changes to `texture` */
  update(dt: number): void
  amountAt(x: number, z: number): number
  directionAt(x: number, z: number): { x: number; z: number }
  /** R = pressed amount, G/B = pressed direction (0.5 = 0) */
  texture: THREE.DataTexture
  bounds: TrampleBounds
}

/** Footpath memory: grass stays pressed where you walked, springing back over ~12 s. */
export function createTrample(bounds: TrampleBounds = { minX: -32, minZ: -40, sx: 144, sz: 68, w: 576, h: 272 }): Trample {
  const { w, h } = bounds
  const amt = new Float32Array(w * h), dxs = new Float32Array(w * h), dzs = new Float32Array(w * h)
  const data = new Uint8Array(w * h * 4)
  const texture = new THREE.DataTexture(data, w, h, THREE.RGBAFormat)
  texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearFilter; texture.needsUpdate = true
  const active = new Set<number>()
  const cellOf = (x: number, z: number) => {
    const i = Math.floor(((x - bounds.minX) / bounds.sx) * w), j = Math.floor(((z - bounds.minZ) / bounds.sz) * h)
    return i < 0 || j < 0 || i >= w || j >= h ? -1 : j * w + i
  }

  return {
    texture, bounds,
    stamp(x, z, dx, dz, strength, radius) {
      const cx = ((x - bounds.minX) / bounds.sx) * w, cz = ((z - bounds.minZ) / bounds.sz) * h, rc = (radius / bounds.sx) * w
      for (let j = Math.floor(cz - rc); j <= Math.ceil(cz + rc); j++) for (let i = Math.floor(cx - rc); i <= Math.ceil(cx + rc); i++) {
        if (i < 0 || j < 0 || i >= w || j >= h) continue
        const ox = i + 0.5 - cx, oz = j + 0.5 - cz, d = Math.hypot(ox, oz) / rc
        if (d > 1) continue
        const wt = (1 - d * d) * strength, k = j * w + i
        // pressed direction: mostly along the walk, a little outward from the foot
        let px = dx * 0.8 + (ox / rc) * 0.6, pz = dz * 0.8 + (oz / rc) * 0.6
        const l = Math.hypot(px, pz) || 1; px /= l; pz /= l
        amt[k] = Math.min(1, amt[k] + wt * 0.5)
        const blend = Math.min(1, wt); dxs[k] += (px - dxs[k]) * blend; dzs[k] += (pz - dzs[k]) * blend
        active.add(k)
      }
    },
    update(dt) {
      for (const k of active) {
        amt[k] = Math.max(0, amt[k] - dt * CONFIG.TRAMPLE.recoverPerSec)
        const o = k * 4
        data[o] = amt[k] * 255; data[o + 1] = (dxs[k] * 0.5 + 0.5) * 255; data[o + 2] = (dzs[k] * 0.5 + 0.5) * 255; data[o + 3] = 255
        if (amt[k] === 0) active.delete(k)
      }
      texture.needsUpdate = true
    },
    amountAt(x, z) { const k = cellOf(x, z); return k < 0 ? 0 : amt[k] },
    directionAt(x, z) { const k = cellOf(x, z); return k < 0 ? { x: 0, z: 0 } : { x: dxs[k], z: dzs[k] } },
  }
}
