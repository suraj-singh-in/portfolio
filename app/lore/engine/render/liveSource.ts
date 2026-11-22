import * as THREE from 'three'
import type { Camera } from './camera'
import type { GlyphAtlas } from './glyphAtlas'
import { glyphMaterial, type GlyphOpts } from './glyphMaterial'

const SUPERSAMPLE = 4

export type LiveSource = {
  /** screen quad drawing this object as symbols */
  quad: THREE.Mesh
  material: THREE.ShaderMaterial
  /** warm point light standing in for the campfire; position is relative to the object */
  fireLight: THREE.PointLight
  layout(ppu: number, symbolScale: number): void
  /** render the 3D object into its off-screen target (call every frame) */
  render(): void
  /** screen rect for an object standing at `world` */
  rect(camera: Camera, world: { x: number; z: number }): { left: number; top: number; w: number; h: number }
  readonly grid: [number, number]
  dispose(): void
}

/**
 * A live 3D object (character/animal) rendered into its own image through a camera locked to it,
 * then drawn as symbols whose grid belongs to the object, not the screen.
 */
export function createLiveSource(
  renderer: THREE.WebGLRenderer,
  camera: Camera,
  atlas: GlyphAtlas,
  object: THREE.Object3D,
  opts: { box: THREE.Box3; margin: number; grid?: [number, number]; cell: [number, number]; glyph: Partial<GlyphOpts> },
): LiveSource {
  const scene = new THREE.Scene()
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8f8676, 0.75))
  const sun = new THREE.DirectionalLight(0xffffff, 3.2); sun.position.set(-5, 9, 5); scene.add(sun)
  const fireLight = new THREE.PointLight(0xff8a3c, 6, 7, 1.6); scene.add(fireLight)
  scene.add(object)

  const center = opts.box.getCenter(new THREE.Vector3())
  let mx = 0, my = 0
  const v = new THREE.Vector3()
  for (let i = 0; i < 8; i++) {
    v.set(i & 1 ? opts.box.max.x : opts.box.min.x, i & 2 ? opts.box.max.y : opts.box.min.y, i & 4 ? opts.box.max.z : opts.box.min.z).sub(center)
    mx = Math.max(mx, Math.abs(v.dot(camera.right))); my = Math.max(my, Math.abs(v.dot(camera.up)))
  }
  const r = Math.max(mx, my) * opts.margin   // wide frame so turning never clips
  const ext = { w: 2 * r, h: 2 * my * opts.margin }

  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200)
  const material = glyphMaterial(atlas, { ...opts.glyph, linearIn: true })
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
  quad.frustumCulled = false
  let rt: THREE.WebGLRenderTarget | null = null
  let grid: [number, number] = [1, 1]
  let pxW = 1, pxH = 1

  return {
    quad, material, fireLight,
    layout(ppu, symbolScale) {
      if (opts.grid) { grid = opts.grid; pxW = ext.w * ppu; pxH = ext.h * ppu }
      else {
        const cw = opts.cell[0] * symbolScale, ch = opts.cell[1] * symbolScale
        grid = [Math.max(4, Math.ceil(ext.w * ppu / cw)), Math.max(4, Math.ceil(ext.h * ppu / ch))]
        pxW = grid[0] * cw; pxH = grid[1] * ch
      }
      const fw = pxW / ppu / 2, fh = pxH / ppu / 2
      Object.assign(cam, { left: -fw, right: fw, top: fh, bottom: -fh }); cam.updateProjectionMatrix()
      cam.position.copy(center).addScaledVector(camera.back, 60); cam.lookAt(center)
      rt?.dispose()
      rt = new THREE.WebGLRenderTarget(grid[0] * SUPERSAMPLE, grid[1] * SUPERSAMPLE, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false })
      material.uniforms.tScene.value = rt.texture
      material.uniforms.grid.value.set(grid[0], grid[1])
    },
    render() {
      if (!rt) return
      renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, cam)
      renderer.setRenderTarget(null)
    },
    rect(c, world) {
      const [cx, cy] = c.worldToScreen(world.x + center.x, center.y, world.z + center.z)
      const w = pxW * c.zoom, h = pxH * c.zoom
      return { left: Math.round(cx - w / 2), top: Math.round(cy - h / 2), w, h }
    },
    get grid() { return grid },
    dispose() { rt?.dispose(); material.dispose(); quad.geometry.dispose(); scene.remove(object) },
  }
}
