import * as THREE from 'three'
import { CONFIG } from '../config'
import type { Vec2 } from '../core/types'
import type { World } from '../world/scatter'
import type { Camera } from './camera'
import { FIELD, type GrassField } from './grassField'
import type { Trample } from './trample'

const MAX_TUFT_ROCKS = 32
const CLUMP = 8

export type Grass = {
  mesh: THREE.LineSegments
  update(camera: Camera, t: number, player: Vec2, horse: Vec2): void
  /** change the target number of visible blades (debug: window.setGrass) */
  setCount(n: number): void
  readonly count: number
  dispose(): void
}

/**
 * GPU-procedural meadow: every blade is a 1-px line whose position, type, height and motion are
 * derived in the vertex shader from gl_InstanceID + a baked field map. Nothing per-blade lives on the CPU.
 * Instance ids [0, tuftTotal) are tufts around rocks; the rest are field blades in clumps of 8.
 */
export function createGrass(opts: { count: number; world: World; field: GrassField; trample: Trample }): Grass {
  const fieldTex = new THREE.DataTexture(opts.field.data, FIELD.w, FIELD.h, THREE.RGBAFormat)
  fieldTex.magFilter = THREE.LinearFilter; fieldTex.minFilter = THREE.LinearFilter; fieldTex.needsUpdate = true

  const rocks = opts.world.rocks.filter((r) => r.tufts).slice(0, MAX_TUFT_ROCKS)
  const tuftRocks = Array.from({ length: MAX_TUFT_ROCKS }, (_, i) => rocks[i] ? new THREE.Vector4(rocks[i].x, rocks[i].z, 0.55 * rocks[i].scale, (i * 2.399) % 6.28) : new THREE.Vector4())
  const tuftEnd: number[] = []
  let acc = 0
  for (let i = 0; i < MAX_TUFT_ROCKS; i++) { acc += rocks[i]?.tuftCount ?? 0; tuftEnd.push(acc) }
  const tuftTotal = acc

  const g = new THREE.InstancedBufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3))

  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, transparent: true, depthTest: false, depthWrite: false,
    uniforms: {
      camT: { value: new THREE.Vector3() }, R: { value: new THREE.Vector3() }, U: { value: new THREE.Vector3() },
      ppu: { value: 80 }, view: { value: new THREE.Vector2(1, 1) }, time: { value: 0 },
      player: { value: new THREE.Vector2() }, horse: { value: new THREE.Vector2() },
      field: { value: fieldTex }, fieldMin: { value: new THREE.Vector2(FIELD.minX, FIELD.minZ) }, fieldSize: { value: new THREE.Vector2(FIELD.sx, FIELD.sz) },
      trample: { value: opts.trample.texture },
      trMin: { value: new THREE.Vector2(opts.trample.bounds.minX, opts.trample.bounds.minZ) },
      trSize: { value: new THREE.Vector2(opts.trample.bounds.sx, opts.trample.bounds.sz) },
      wind: { value: new THREE.Vector2(...CONFIG.WIND.dir).normalize() }, windStr: { value: CONFIG.WIND.strength },
      tuftRocks: { value: tuftRocks }, tuftEnd: { value: tuftEnd }, tuftTotal: { value: tuftTotal },
    },
    vertexShader: /* glsl */`
      #define MAX_TUFT_ROCKS ${MAX_TUFT_ROCKS}
      uniform vec3 camT; uniform vec3 R; uniform vec3 U; uniform float ppu; uniform vec2 view; uniform float time;
      uniform vec2 player; uniform vec2 horse;
      uniform sampler2D field; uniform vec2 fieldMin; uniform vec2 fieldSize;
      uniform sampler2D trample; uniform vec2 trMin; uniform vec2 trSize; uniform vec2 wind; uniform float windStr;
      uniform vec4 tuftRocks[MAX_TUFT_ROCKS]; uniform float tuftEnd[MAX_TUFT_ROCKS]; uniform float tuftTotal;
      out float vSh; out float vT; out float vFlat; out float vType;

      uint pcg(uint v){ uint s = v*747796405u + 2891336453u; uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u; return (w >> 22u) ^ w; }
      float h01(uint v){ return float(pcg(v)) / 4294967296.0; }
      vec2 proj(vec3 w){ vec3 d = w - camT; return vec2(view.x*0.5 + dot(d,R)*ppu, view.y*0.5 + dot(d,U)*ppu); }
      vec4 fieldAt(vec2 p){ return texture(field, (p - fieldMin)/fieldSize); }
      bool accept(float d, float r){ return r <= pow(d, 1.4)*1.15; }
      float heightOf(float ty, float f){
        return ty < 0.5 ? 0.07 + f*0.17 : ty < 1.5 ? 0.2 + f*0.16 : ty < 2.5 ? 0.05 + f*0.05 : ty < 3.5 ? 0.08 + f*0.1 : 0.1 + f*0.08;
      }
      float typeOf(vec4 fl, float r){
        float bits = floor(fl.b*255.0 + 0.5);
        bool flower = bits >= 128.0; bool dry = mod(bits, 128.0) >= 64.0;
        if (flower && r < 0.3) return 4.0;
        if (dry) return r < 0.75 ? 3.0 : 0.0;
        if (r < fl.a) return 1.0;
        if (r < 0.14) return 2.0;
        return 0.0;
      }
      void cull(){ gl_Position = vec4(2.0, 2.0, 2.0, 1.0); }

      void main(){
        uint id = uint(gl_InstanceID);
        vec2 pos; float L; float lean; float ty = 0.0;
        float fid = float(gl_InstanceID);
        if (fid < tuftTotal) {
          // tufts hugging a rock, leaning away from it, broken into irregular arcs
          int k = 0;
          for (int i = 0; i < MAX_TUFT_ROCKS; i++) { if (fid >= tuftEnd[i]) k = i + 1; }
          vec4 rk = tuftRocks[k];
          float a = h01(id*7u)*6.2831853, d = rk.z*(0.5 + pow(h01(id*7u+1u), 1.4));
          if (sin(a*2.0 + rk.w) > 0.55 && h01(id*7u+2u) < 0.7) { cull(); return; }
          pos = rk.xy + vec2(cos(a)*d*1.1, sin(a)*d*0.9);
          if (fieldAt(pos).r < 0.004 && length(pos - rk.xy) < rk.z*0.45) { cull(); return; }
          L = (0.11 + h01(id*7u+3u)*0.1)*(1.25 - (d/rk.z - 0.5)*0.25);
          lean = cos(a)*(0.12 + h01(id*7u+4u)*0.1) + (h01(id*7u+5u) - 0.5)*0.08;
        } else {
          uint fidx = id - uint(tuftTotal);
          uint cid = fidx / ${CLUMP}u;
          vec2 c = fieldMin + vec2(h01(cid*5u), h01(cid*5u+1u))*fieldSize;
          bool clump = h01(cid*5u+2u) < 0.5;
          vec2 p = clump ? c : fieldMin + vec2(h01(fidx*3u+11u), h01(fidx*3u+12u))*fieldSize;
          vec4 fl = fieldAt(p);
          if (!accept(fl.r, clump ? h01(cid*5u+3u) : h01(fidx*3u+13u))) { cull(); return; }
          if (clump) {
            float spread = 0.06 + h01(cid*5u+4u)*0.22;
            vec2 off = vec2(h01(fidx*4u+1u) + h01(fidx*4u+2u) - 1.0, (h01(fidx*4u+3u) + h01(fidx*4u+4u) - 1.0)*0.8)*spread;
            pos = c + off;
            if (fieldAt(pos).r < 0.004) { cull(); return; }
            ty = typeOf(fl, h01(cid*9u+7u));
            if (ty > 3.5 && h01(fidx*4u+5u) < 0.6) ty = 0.0;      // flower clumps keep some plain blades
            L = heightOf(ty, fl.g)*(0.7 + h01(fidx*4u+6u)*0.6);
            lean = off.x*0.9 + (h01(fidx*4u+7u) - 0.5)*0.12;
          } else {
            pos = p;
            ty = typeOf(fl, h01(fidx*3u+14u));
            L = heightOf(ty, fl.g)*(0.65 + h01(fidx*3u+15u)*0.7);
            lean = (h01(fidx*3u+16u) - 0.5)*0.18;
          }
        }
        float ph = h01(id*13u+3u)*6.28, sh = h01(id*13u+4u);
        float t = position.y;
        // ambient wind: gust bands rolling across the field + per-blade flutter
        float band = sin(dot(pos, wind)*0.33 - time*1.7)*0.5 + 0.5;
        float gust = band*band*band;
        float flutter = sin(time*3.3 + ph + pos.x*1.7 + pos.y*1.1);
        vec2 bend = wind*(0.14 + gust*0.75)*windStr + vec2(-wind.y, wind.x)*flutter*0.12 + vec2(lean, lean*0.5);
        float h = 1.0 - gust*0.18*windStr;
        // live push: blades bend away from feet and hooves and get squashed down
        vec2 pd = pos - player; float pr = length(pd); float pk = smoothstep(0.6, 0.05, pr);
        bend += (pd/max(pr,1e-3))*pk*1.8; h -= pk*0.6;
        vec2 hd = pos - horse; float hr = length(hd); float hk = smoothstep(1.2, 0.35, hr);
        bend += (hd/max(hr,1e-3))*hk*0.9; h -= hk*0.3;
        // trample memory: pressed flat along the walk, slowly springing back
        vec4 tr = texture(trample, (pos - trMin)/trSize);
        float am = tr.r; vec2 td = tr.gb*2.0 - 1.0;
        bend = mix(bend, td*1.9, am*0.9); h -= am*0.7;
        h = max(h, 0.12);
        vec3 w = vec3(pos.x + bend.x*L*0.75*t*t, L*1.3*h*t, pos.y + bend.y*L*0.75*t*t);
        vec2 sp = proj(w);
        vSh = sh; vT = t; vFlat = am; vType = ty;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(sp, 0.0, 1.0);
      }`,
    fragmentShader: /* glsl */`
      precision highp float; in float vSh; in float vT; in float vFlat; in float vType; out vec4 outColor;
      void main(){
        vec3 a = vec3(0.36,0.50,0.30), b = vec3(0.25,0.40,0.22), c = vec3(0.52,0.62,0.40);
        vec3 col = vSh < 0.4 ? a : (vSh < 0.75 ? b : c);
        if (vType > 0.5 && vType < 1.5) col = mix(vec3(0.46,0.54,0.36), vec3(0.70,0.68,0.50), vT);
        else if (vType > 1.5 && vType < 2.5) col = mix(vec3(0.20,0.34,0.18), vec3(0.30,0.46,0.25), vSh);
        else if (vType > 2.5 && vType < 3.5) col = mix(vec3(0.62,0.56,0.36), vec3(0.75,0.68,0.45), vSh);
        else if (vType > 3.5) {
          vec3 head = vSh < 0.4 ? vec3(0.96,0.95,0.90) : (vSh < 0.75 ? vec3(0.95,0.80,0.30) : vec3(0.66,0.52,0.82));
          col = vT > 0.5 ? head : vec3(0.32,0.45,0.27);
        }
        col = mix(col, vec3(0.64,0.63,0.47), vFlat*0.45);
        outColor = vec4(col, (0.95 - vT*0.35) * (vSh < 0.75 ? 0.95 : 0.8));
      }`,
  })

  const mesh = new THREE.LineSegments(g, material)
  mesh.frustumCulled = false
  mesh.renderOrder = -1e9
  let count = 0
  const setCount = (n: number) => {
    count = Math.max(1000, Math.round(n))
    // candidates are culled by the density test, so ask for enough to land ~count visible blades
    g.instanceCount = tuftTotal + Math.ceil(Math.max(0, count - tuftTotal) / Math.max(0.05, opts.field.meanAcceptance))
  }
  setCount(opts.count)

  return {
    mesh,
    setCount,
    get count() { return count },
    update(camera, t, player, horse) {
      const u = material.uniforms
      u.camT.value.copy(camera.target)
      u.R.value.copy(camera.right); u.U.value.copy(camera.up)
      u.ppu.value = camera.pz; u.view.value.set(camera.width, camera.height)
      u.time.value = t; u.player.value.set(player.x, player.z); u.horse.value.set(horse.x, horse.z)
    },
    dispose() { g.dispose(); material.dispose(); fieldTex.dispose() },
  }
}
