import * as THREE from 'three'
import { CONFIG } from '../config'
import type { Vec2 } from '../core/types'

export type Camera = {
  setViewport(w: number, h: number): void
  /** follow: point to centre on; wheel: accumulated deltaY; zoomStep: +1 in, -1 out, 0 none */
  update(dt: number, follow: Vec2, wheel: number, zoomStep: -1 | 0 | 1): void
  worldToScreen(x: number, y: number, z: number): [number, number]
  /** Snap the follow target (no easing), e.g. on spawn. */
  snap(follow: Vec2): void
  readonly zoom: number
  /** base pixels per metre (from viewport height); layout and bakes use this */
  readonly ppu: number
  /** on-screen pixels per metre = ppu × zoom */
  readonly pz: number
  readonly width: number
  readonly height: number
  readonly right: THREE.Vector3
  readonly up: THREE.Vector3
  /** unit vector from the scene toward the camera */
  readonly back: THREE.Vector3
}

export function createCamera(): Camera {
  const Z = CONFIG.ZOOM
  const offset = new THREE.Vector3(...CONFIG.CAMERA.offset)
  const rig = new THREE.OrthographicCamera()
  rig.position.copy(offset); rig.lookAt(0, 0, 0)
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(rig.quaternion)
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(rig.quaternion)
  const back = offset.clone().normalize()
  const target = new THREE.Vector3()
  const d = new THREE.Vector3()
  let w = 1, h = 1, ppu = 80, zoom: number = Z.default, zoomT: number = Z.default
  const clampZ = (v: number) => Math.min(Z.max, Math.max(Z.min, v))

  return {
    setViewport(nw, nh) { w = nw; h = nh; ppu = Math.max(56, Math.min(120, nh / 8)) },
    update(dt, follow, wheel, zoomStep) {
      if (wheel) zoomT = clampZ(zoomT * Math.exp(-Math.max(-300, Math.min(300, wheel)) * 0.0016))
      if (zoomStep) zoomT = clampZ(zoomStep > 0 ? zoomT * 1.1 : zoomT / 1.1)
      zoom += (zoomT - zoom) * Math.min(1, dt * CONFIG.CAMERA.zoomRate)
      const k = Math.min(1, dt * CONFIG.CAMERA.followRate)
      target.x += (follow.x - target.x) * k
      target.z += (follow.z - target.z) * k
    },
    snap(follow) { target.set(follow.x, 0, follow.z) },
    worldToScreen(x, y, z) {
      d.set(x - target.x, y - target.y, z - target.z)
      const pz = ppu * zoom
      return [w / 2 + d.dot(right) * pz, h / 2 - d.dot(up) * pz]
    },
    get zoom() { return zoom },
    get ppu() { return ppu },
    get pz() { return ppu * zoom },
    get width() { return w },
    get height() { return h },
    right, up, back,
  }
}
