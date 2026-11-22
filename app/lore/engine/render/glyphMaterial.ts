import * as THREE from 'three'
import type { GlyphAtlas } from './glyphAtlas'

/** Per-object look of the glyph conversion. */
export type GlyphOpts = {
  /** 0 = pure ink colour, 1 = object colour */
  tint: number
  ink: string
  /** tone curve steepness around `mid` */
  contrast: number
  mid: number
  /** faint colour wash behind the symbols */
  wash: number
  /** opaque paper-toned silhouette behind the symbols (nothing shows through) */
  solid: boolean
  /** with solid: how much of the base is paper (1 = clean paper under the symbols, 0 = the object's own colour) */
  paper: number
  /** input texture is linear (live three.js render) rather than sRGB (baked sprite) */
  linearIn: boolean
  /** wind bend amplitude (trees, undergrowth) */
  sway: number
}

export const DEFAULT_GLYPH: GlyphOpts = { tint: 0.3, ink: '#1b1a17', contrast: 1.4, mid: 0.36, wash: 0.18, solid: false, paper: 0.55, linearIn: false, sway: 0 }

export const QUAD_VS = /* glsl */`
out vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`

const GLYPH_FS = /* glsl */`
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D tScene; uniform sampler2D tAtlas;
uniform vec2 grid; uniform float nRamp; uniform float nTotal;
uniform vec3 ink; uniform float tint; uniform float mode; uniform float linearIn;
uniform float sway; uniform float time; uniform float phase; uniform float opacity;
uniform float contrast; uniform float mid; uniform float wash; uniform float solid; uniform float paperMix;

vec3 toS(vec3 c){ return linearIn > 0.5 ? pow(c, vec3(1./2.2)) : c; }
vec4 cellSample(vec2 c){
  vec2 o = vec2(0.25)/grid; vec2 uv = (c+0.5)/grid;
  vec4 a = texture(tScene,uv+vec2(-o.x,-o.y)), b = texture(tScene,uv+vec2(o.x,-o.y)),
       d = texture(tScene,uv+vec2(-o.x,o.y)),  e = texture(tScene,uv+vec2(o.x,o.y));
  vec3 rgb = a.rgb*a.a + b.rgb*b.a + d.rgb*d.a + e.rgb*e.a;
  float al = a.a+b.a+d.a+e.a;
  return vec4(rgb/max(al,1e-4), al*0.25);
}
float dk(vec2 c){
  if(c.x<0.||c.y<0.||c.x>=grid.x||c.y>=grid.y) return 0.;
  vec4 s = cellSample(c);
  float l = dot(toS(s.rgb), vec3(.299,.587,.114));
  return s.a*(0.25+0.75*(1.-l));
}
void main(){
  vec2 p = vUv;
  p.x += sway*sin(time*1.1+phase)*p.y*p.y + sway*0.4*sin(time*2.7+phase*1.7)*p.y*p.y*p.y;
  if(mode>0.5){
    vec4 s = texture(tScene,p); if(s.a<0.3) discard;
    outColor = vec4(toS(s.rgb), opacity); return;
  }
  vec2 gp = p*grid; vec2 cell = floor(gp); vec2 f = fract(gp);
  vec4 s = cellSample(cell);
  if(s.a<0.15) discard;
  vec3 col = toS(s.rgb);
  float l = dot(col, vec3(.299,.587,.114));
  float d = smoothstep(0., 1., ((1.-l) - mid)*contrast + 0.5);
  float idx = clamp(floor(mix(3., nRamp-1., d)+0.5), 3., nRamp-1.);
  // edges are always on: silhouette/fold direction picks one of the 4 edge glyphs
  float L=dk(cell+vec2(-1.,0.)), R=dk(cell+vec2(1.,0.)), U=dk(cell+vec2(0.,1.)), D=dk(cell+vec2(0.,-1.));
  vec2 g = vec2(R-L, U-D);
  if(length(g)>0.45){
    float a = atan(g.y,g.x); if(a<0.) a += 3.14159265;
    float k = mod(floor(a/0.78539816+0.5), 4.);
    float e = k<0.5 ? 0. : (k<1.5 ? 3. : (k<2.5 ? 2. : 1.));
    idx = nRamp + e;
  }
  vec2 auv = vec2((idx+f.x)/nTotal, f.y);
  vec2 dx = dFdx(gp)/vec2(nTotal,1.), dy = dFdy(gp)/vec2(nTotal,1.);
  float m = smoothstep(0.04, 0.55, textureGrad(tAtlas, auv, dx, dy).a);
  vec3 vivid = clamp(mix(vec3(l), col, 1.9), 0., 1.);
  vec3 c = mix(ink, vivid*0.78, tint);
  col = mix(col, vivid, 0.6);
  float wa = wash*(0.35+0.65*d);
  float a = max(m, wa);
  vec3 rgb = mix(col*0.95, c, m/max(a,1e-4));
  if(solid > 0.5){ vec3 base = mix(col, vec3(0.965,0.955,0.93), paperMix); rgb = mix(base, c, m); a = 1.0; }
  outColor = vec4(rgb, a*opacity*smoothstep(0.15,0.35,s.a));
}`

/** Material that converts `tScene` into symbols on a `grid` of cells. */
export function glyphMaterial(atlas: GlyphAtlas, opts: Partial<GlyphOpts>, phase = 0): THREE.ShaderMaterial {
  const o = { ...DEFAULT_GLYPH, ...opts }
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: QUAD_VS, fragmentShader: GLYPH_FS,
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: {
      tScene: { value: null }, tAtlas: { value: atlas.texture }, grid: { value: new THREE.Vector2(1, 1) },
      nRamp: { value: atlas.nRamp }, nTotal: { value: atlas.nTotal }, ink: { value: new THREE.Color(o.ink) },
      tint: { value: o.tint }, mode: { value: 0 }, linearIn: { value: o.linearIn ? 1 : 0 }, sway: { value: o.sway },
      time: { value: 0 }, phase: { value: phase }, opacity: { value: 1 }, contrast: { value: o.contrast },
      mid: { value: o.mid }, wash: { value: o.wash }, solid: { value: o.solid ? 1 : 0 }, paperMix: { value: o.paper },
    },
  })
}

const CACHED_FS = /* glsl */`
precision highp float; in vec2 vUv; out vec4 outColor;
uniform sampler2D map; uniform float opacity; uniform float sway; uniform float time; uniform float phase;
void main(){
  vec2 p = vUv;
  p.x -= sway*(sin(time*1.1+phase)*p.y*p.y + 0.4*sin(time*2.7+phase*1.7)*p.y*p.y*p.y);
  outColor = texture(map, p) * opacity;      // baked texture is premultiplied
}`

/** Draws an already-baked symbol texture, with a cheap wind bend. */
export function cachedMaterial(sway: number, phase: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: QUAD_VS, fragmentShader: CACHED_FS,
    transparent: true, depthTest: false, depthWrite: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    uniforms: { map: { value: null }, opacity: { value: 1 }, sway: { value: sway }, time: { value: 0 }, phase: { value: phase } },
  })
}
