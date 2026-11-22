import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { stripRootTracks } from './characters'

describe('rider clips', () => {
  it('drop every Root bone track (the Blender import flips and offsets that bone) and keep everything else', () => {
    const clip = new THREE.AnimationClip('Ride_Idle', 1, [
      new THREE.VectorKeyframeTrack('Root.position', [0], [0, 0.0072, -0.0526]),
      new THREE.QuaternionKeyframeTrack('Root.quaternion', [0], [0, 0, 0, 1]),
      new THREE.VectorKeyframeTrack('Body.position', [0], [0, 0.0083, 0]),
      new THREE.VectorKeyframeTrack('FootL.position', [0], [0.0038, 0.0027, -0.0037]),
    ])
    const [out] = stripRootTracks([clip])
    expect(out.name).toBe('Ride_Idle')
    expect(out.tracks.map((t) => t.name)).toEqual(['Body.position', 'FootL.position'])
  })
})
