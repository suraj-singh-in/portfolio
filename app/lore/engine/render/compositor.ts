import * as THREE from 'three'
import type { Vec2 } from '../core/types'
import type { Camera } from './camera'

export type Rect = { left: number; top: number; w: number; h: number }

/** One symbol-drawn object on screen (character, horse or baked scenery). */
export type DrawItem = {
  mesh: THREE.Mesh
  world: Vec2
  rect(camera: Camera): Rect
  isTree: boolean
  /** fades see-through when standing between you and the camera (trees always do) */
  seeThrough?: boolean
  /** soft ground-shadow size in metres (0 = none) */
  shadow: number
  /** lies on the ground (paving): drawn beneath everything standing */
  flat?: boolean
  /** extra transparency (reflections) */
  alpha?: number
  /** set by the compositor each frame */
  vis: boolean
  fade: number
}

export type Compositor = {
  /** the screen-space scene everything is drawn in (grass, fire and quads) */
  scene: THREE.Scene
  add(item: DrawItem): void
  readonly items: readonly DrawItem[]
  setViewport(w: number, h: number): void
  /** place and depth-sort every item, fade trees in front of the player, then render */
  draw(camera: Camera, player: Vec2, t: number, dt: number): void
  dispose(): void
}

export function createCompositor(renderer: THREE.WebGLRenderer): Compositor {
  const scene = new THREE.Scene()
  const cam = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10)
  const items: DrawItem[] = []
  let W = 1, H = 1

  return {
    scene,
    items,
    add(item) { item.mesh.frustumCulled = false; items.push(item); scene.add(item.mesh) },
    setViewport(w, h) { W = w; H = h; Object.assign(cam, { left: 0, right: w, top: h, bottom: 0 }); cam.updateProjectionMatrix() },
    draw(camera, player, t, dt) {
      const [psx, psy] = camera.worldToScreen(player.x, 0.9, player.z)
      const [, pgy] = camera.worldToScreen(player.x, 0, player.z)
      for (const it of items) {
        const { left, top, w, h } = it.rect(camera)
        const [, gy] = camera.worldToScreen(it.world.x, 0, it.world.z)
        it.vis = left < W && left + w > 0 && top < H && top + h > 0
        it.mesh.visible = it.vis
        if (!it.vis) continue
        it.mesh.scale.set(w, h, 1)
        it.mesh.position.set(left + w / 2, H - (top + h / 2), 0)
        it.mesh.renderOrder = it.flat ? gy - 1e5 : gy
        // trees standing between the player and the camera turn see-through
        const behind = (it.isTree || it.seeThrough) && gy > pgy + 4 && psx > left + w * 0.15 && psx < left + w * 0.85 && psy > top && psy < gy
        it.fade += ((behind ? 0.22 : 1) - it.fade) * Math.min(1, dt * 6)
        const u = (it.mesh.material as THREE.ShaderMaterial).uniforms
        if (u?.opacity) u.opacity.value = it.fade * (it.alpha ?? 1)
        if (u?.time) u.time.value = t
      }
      renderer.setRenderTarget(null)
      renderer.clear()
      renderer.render(scene, cam)
    },
    dispose() {
      for (const it of items) { scene.remove(it.mesh) }
      items.length = 0
    },
  }
}
