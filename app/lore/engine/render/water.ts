import * as THREE from 'three'
import { LAKE } from '../world/north'
import type { Camera } from './camera'
import type { DrawItem } from './compositor'
import type { GlyphAtlas } from './glyphAtlas'
import { RAMP } from './glyphAtlas'

/** symbol cell on the water, in metres across (x) and in on-screen metres down (z is scaled by the view) */
const CELL = { x: 0.13, y: 0.2 }
const idx = (ch: string) => RAMP.indexOf(ch)

/**
 * The lake as ASCII: a screen quad over the water whose fragments are mapped back onto the ground,
 * so the symbol grid is pinned to the world. Waves roll in as rows of ~ and -, foam breaks on the
 * shoreline, and a darker = band lies under the mountains on the far side.
 */
export function createWater(atlas: GlyphAtlas): { item: DrawItem; update(camera: Camera, dpr: number): void; dispose(): void } {
  const [b0, b1, b2] = LAKE.bay
  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, transparent: true, depthTest: false, depthWrite: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    uniforms: {
      tAtlas: { value: atlas.texture }, nTotal: { value: atlas.nTotal },
      time: { value: 0 }, opacity: { value: 1 },
      // screen → ground: x = tx + (sx - cx)/pz,  z = tz + (cy - sy)/(pz*uz)
      view: { value: new THREE.Vector4() }, cam: { value: new THREE.Vector4() },
    },
    vertexShader: /* glsl */`
      void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform sampler2D tAtlas; uniform float nTotal; uniform float time; uniform float opacity;
      uniform vec4 view;   // cx, cy, css height, dpr
      uniform vec4 cam;    // tx, tz, pz, uz
      out vec4 outColor;
      float shoreZ(float x){ return ${LAKE.shore.toFixed(3)} + 0.25*sin(x*0.35) + 0.15*sin(x*0.9 + 1.0) + ${b2.toFixed(3)}*smoothstep(${b0.toFixed(1)}, ${b1.toFixed(1)}, abs(x)); }
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){
        vec2 s = vec2(gl_FragCoord.x, view.z*view.w - gl_FragCoord.y) / view.w;      // css px, top-left origin
        float x = cam.x + (s.x - view.x)/cam.z;
        float z = cam.y + (view.y - s.y)/(cam.z*cam.w);
        float shore = shoreZ(x);
        if (z > shore || z < ${(LAKE.farZ - 0.6).toFixed(2)}) discard;
        // world-pinned symbol grid
        vec2 gs = vec2(x / ${CELL.x}, z * abs(cam.w) / ${CELL.y});
        vec2 cell = floor(gs), f = fract(gs);
        vec2 c = (cell + 0.5) * vec2(${CELL.x}, ${CELL.y} / abs(cam.w));
        float sh = shoreZ(c.x), depth = clamp((sh - c.y) / (sh - ${LAKE.farZ.toFixed(2)}), 0.0, 1.0);
        // waves: long swells rolling toward the shore, broken by a slower cross-chop
        float w = 0.62*sin(c.y*2.6 + time*1.2 + 1.4*sin(c.x*0.19 + time*0.17)) + 0.38*sin(c.x*0.8 - c.y*1.6 - time*0.75);
        float r = hash(cell);
        float ch = ${idx(' ')}.0;
        if (w > 0.6) ch = ${idx('~')}.0; else if (w > 0.22) ch = ${idx('-')}.0; else if (w > -0.2 && r < 0.45) ch = ${idx('.')}.0;
        float foam = smoothstep(0.55, 0.0, sh - c.y);                                   // breaking along the waterline
        if (foam > 0.2 && r < 0.55 + 0.4*sin(time*2.1 + c.x*1.7)) ch = ${idx('~')}.0;
        if (depth > 0.9) ch = (r < 0.7) ? ${idx('=')}.0 : ${idx('-')}.0;                   // the dark line under the peaks
        if (ch < 0.5) discard;
        vec2 auv = vec2((ch + f.x) / nTotal, 1.0 - f.y);
        float m = smoothstep(0.04, 0.55, texture(tAtlas, auv).a);
        if (m < 0.02) discard;
        vec3 near = vec3(0.42, 0.53, 0.56), far = vec3(0.2, 0.28, 0.31), spray = vec3(0.86, 0.9, 0.9);
        vec3 col = mix(mix(near, far, depth), spray, foam * 0.7);
        float a = m * opacity * (0.55 + 0.45*depth + 0.3*foam);
        outColor = vec4(col * a, a);
      }`,
  })
  const geo = new THREE.PlaneGeometry(1, 1)
  const mesh = new THREE.Mesh(geo, material)
  const view = material.uniforms.view.value as THREE.Vector4, cam = material.uniforms.cam.value as THREE.Vector4
  const item: DrawItem = {
    mesh, world: { x: 0, z: LAKE.farZ }, isTree: false, shadow: 0, vis: false, fade: 1, flat: true,
    // the lake's whole band on screen: from beyond the far side to the nearest point of the waterline
    rect(c) {
      const [l] = c.worldToScreen(-LAKE.half, 0, LAKE.shore), [r] = c.worldToScreen(LAKE.half, 0, LAKE.shore)
      const [, top] = c.worldToScreen(0, 0, LAKE.farZ - 1), [, bottom] = c.worldToScreen(0, 0, LAKE.shore + LAKE.bay[2] + 0.5)
      return { left: Math.floor(l), top: Math.floor(top), w: Math.ceil(r - l), h: Math.ceil(bottom - top) }
    },
  }
  return {
    item,
    update(c, dpr) {
      view.set(c.width / 2, c.height / 2, c.height, dpr)
      cam.set(c.target.x, c.target.z, c.pz, c.up.z)
    },
    dispose() { geo.dispose(); material.dispose() },
  }
}
