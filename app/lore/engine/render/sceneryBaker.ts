import * as THREE from 'three'
import type { SpriteMeta } from '../assets/manifest'
import type { GlyphAtlas } from './glyphAtlas'
import { glyphMaterial, type GlyphOpts } from './glyphMaterial'

export type BakedSprite = {
  texture: THREE.Texture
  /** size in CSS px at zoom 1 */
  pxW: number
  pxH: number
  /** ground-origin anchor in CSS px from top-left */
  ax: number
  ay: number
}

export type SceneryBaker = {
  /** Convert a sprite to symbols once and cache it (keyed by name, scale and look). */
  bake(name: string, scale: number, cell: [number, number], opts: Partial<GlyphOpts>): BakedSprite
  /** Drop every cached bake (on resize / symbol-size / raw-mode change). */
  clear(): void
  setLayout(ppu: number, dpr: number, symbolScale: number, raw: boolean): void
  dispose(): void
}

export function createSceneryBaker(renderer: THREE.WebGLRenderer, atlas: GlyphAtlas, sprites: Record<string, THREE.Texture>, manifest: Record<string, SpriteMeta>): SceneryBaker {
  const cache = new Map<string, BakedSprite & { rt: THREE.WebGLRenderTarget }>()
  const scene = new THREE.Scene()
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1))
  scene.add(mesh)
  const cam = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 1)
  let ppu = 80, dpr = 1, symbolScale = 0.5, raw = false

  const clear = () => { for (const e of cache.values()) e.rt.dispose(); cache.clear() }

  return {
    setLayout(p, d, s, r) { ppu = p; dpr = d; symbolScale = s; raw = r; clear() },
    clear,
    bake(name, scale, cell, opts) {
      const m = manifest[name]
      const sc = Math.round(scale * 10) / 10
      const key = JSON.stringify([name, sc, cell, opts])
      const hit = cache.get(key)
      if (hit) return hit
      const k = (ppu / m.ppu) * sc, cw = cell[0] * symbolScale, ch = cell[1] * symbolScale
      const cols = Math.max(4, Math.round((m.w * k) / cw)), rows = Math.max(4, Math.round((m.h * k) / ch))
      const pxW = cols * cw, pxH = rows * ch
      const mat = glyphMaterial(atlas, { ...opts, sway: 0 })
      mat.uniforms.tScene.value = sprites[name]
      mat.uniforms.grid.value.set(cols, rows)
      mat.uniforms.mode.value = raw ? 1 : 0
      const rt = new THREE.WebGLRenderTarget(Math.ceil(pxW * dpr), Math.ceil(pxH * dpr), { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false })
      mesh.material = mat
      mesh.scale.set(pxW, pxH, 1); mesh.position.set(pxW / 2, pxH / 2, 0)
      Object.assign(cam, { right: pxW, top: pxH }); cam.updateProjectionMatrix()
      renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, cam); renderer.setRenderTarget(null)
      mat.dispose()
      const e = { rt, texture: rt.texture, pxW, pxH, ax: (m.anchor[0] * pxW) / m.w, ay: (m.anchor[1] * pxH) / m.h }
      cache.set(key, e)
      return e
    },
    dispose() { clear(); mesh.geometry.dispose() },
  }
}
