import * as THREE from 'three'
import { CONFIG } from '../config'

/** An animated glTF character with named clips and cross-fading. */
export type Animated = {
  root: THREE.Object3D
  mixer: THREE.AnimationMixer
  /** cross-fade to a clip; once = play a single time and hold the last pose */
  play(name: string, fade?: number, once?: boolean): void
  /** merge extra clips (e.g. an animation-only GLB authored on the same skeleton) */
  addClips(clips: THREE.AnimationClip[]): void
  readonly current: string | null
}

function animated(root: THREE.Object3D, clips: THREE.AnimationClip[]): Animated {
  const mixer = new THREE.AnimationMixer(root)
  const actions = new Map<string, THREE.AnimationAction>()
  const addClips = (list: THREE.AnimationClip[]) => { for (const c of list) actions.set(c.name.split('|').pop()!, mixer.clipAction(c)) }
  addClips(clips)
  let current: string | null = null
  return {
    root, mixer, addClips,
    play(name, fade = 0.3, once = false) {
      if (current === name) return
      const a = actions.get(name)
      if (!a) return
      a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity)
      a.clampWhenFinished = once
      a.reset().fadeIn(fade).play()
      if (current) actions.get(current)?.fadeOut(fade)
      current = name
    },
    get current() { return current },
  }
}

/**
 * The rider clips were authored in Blender, whose glTF import gives the Root bone a different rest
 * (rotated 180° and offset 5.26 m down / 0.79 m back) than the hero GLB. Root never moves in our clips,
 * so drop its tracks and let the hero's own Root stand; every other bone matches the hero exactly.
 */
export function stripRootTracks(clips: THREE.AnimationClip[]): THREE.AnimationClip[] {
  return clips.map((c) => new THREE.AnimationClip(c.name, c.duration, c.tracks.filter((t) => !t.name.startsWith('Root.'))))
}

const setColor = (m: THREE.Material, rgb: readonly [number, number, number]) => {
  const s = m as THREE.MeshStandardMaterial
  s.color.setRGB(rgb[0], rgb[1], rgb[2]); s.roughness = 0.85; s.metalness = 0
}

/** Hero: soft medieval palette, red tunic (body mesh only — the backpack shares the material). */
export function prepareHero(scene: THREE.Object3D, clips: THREE.AnimationClip[]): Animated {
  scene.traverse((o) => {
    o.frustumCulled = false
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    const mats = ([] as THREE.Material[]).concat(mesh.material)
    for (const m of mats) { const c = CONFIG.PALETTE[m.name]; if (c) setColor(m, c) }
    if (/Adventurer_Body/.test(mesh.name)) {
      const next = mats.map((m) => { const c = CONFIG.HERO_SHIRT[m.name]; if (!c) return m; const k = m.clone(); setColor(k, c); return k })
      mesh.material = Array.isArray(mesh.material) ? next : next[0]
    }
  })
  return animated(scene, clips)
}

export type Horse = Animated & {
  /** yaw (radians) of the horse's head direction when root rotation is 0 */
  forward0: number
  /** turn neck and head toward `look` radians (already smoothed by the caller) */
  applyLook(look: number): void
}

const _q = new THREE.Quaternion(), _qi = new THREE.Quaternion(), _ax = new THREE.Vector3()
function yawBone(bone: THREE.Object3D, ang: number) {
  bone.parent!.getWorldQuaternion(_qi); _qi.invert(); _ax.set(0, 1, 0).applyQuaternion(_qi)
  bone.quaternion.premultiply(_q.setFromAxisAngle(_ax, ang))
}

export function prepareHorse(scene: THREE.Object3D, clips: THREE.AnimationClip[]): Horse {
  scene.traverse((o) => { o.frustumCulled = false })
  scene.updateMatrixWorld(true)
  const tail = scene.getObjectByName('Tail1'), head = scene.getObjectByName('Head')
  let forward0 = 0
  if (tail && head) {
    const a = tail.getWorldPosition(new THREE.Vector3()), b = head.getWorldPosition(new THREE.Vector3())
    forward0 = Math.atan2(b.x - a.x, b.z - a.z)
  }
  const bones = ['Neck1', 'Neck2', 'Neck3', 'Head'].map((n) => scene.getObjectByName(n)).filter((b): b is THREE.Object3D => !!b)
  const weights = [0.2, 0.25, 0.25, 0.3]
  return {
    ...animated(scene, clips),
    forward0,
    applyLook(look) { bones.forEach((b, i) => yawBone(b, look * weights[i])) },
  }
}
