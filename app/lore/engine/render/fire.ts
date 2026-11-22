import * as THREE from 'three'
import type { Vec2 } from '../core/types'
import type { Camera } from './camera'

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; kind: 'flame' | 'smoke' | 'ember' }

const W = 220, H = 300, BASE_Y = H - 34
/** spawn rates per second (prototype spawned per frame at ~60 fps) */
const RATE = { flame: 420, smoke: 21, ember: 7.2 }
const MONO = 'Consolas, Menlo, monospace'

export type Fire = {
  mesh: THREE.Mesh
  /** advance particles and place the fire quad over the pit at `at` */
  update(dt: number, t: number, camera: Camera, at: Vec2): void
  dispose(): void
}

/** Glyph campfire: ember bed, charred logs with glowing cracks, flames, smoke and sparks. */
export function createFire(rand: () => number): Fire {
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const ctx = cv.getContext('2d')!
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }))
  mesh.frustumCulled = false

  const coals = Array.from({ length: 150 }, () => {
    const a = rand() * Math.PI * 2, r = Math.sqrt(rand())
    return { x: Math.cos(a) * r * 44, y: Math.sin(a) * r * 17, ch: '.,:;o*'[(rand() * 6) | 0], ph: rand() * 6.28, s: 0.6 + rand() * 0.8 }
  })
  const logs: [number, number, number, number][] = [[-42, 10, 34, -8], [-32, -9, 42, 9], [-8, 15, 9, -14]]
  const parts: Particle[] = []
  const owed = { flame: 0, smoke: 0, ember: 0 }
  const bx = W / 2, by = BASE_Y

  const drawBase = (t: number) => {
    const g = ctx.createRadialGradient(bx, by, 2, bx, by, 56)
    g.addColorStop(0, 'rgba(255,120,40,.55)'); g.addColorStop(1, 'rgba(255,120,40,0)')
    ctx.save(); ctx.translate(bx, by); ctx.scale(1, 0.4); ctx.translate(-bx, -by); ctx.fillStyle = g; ctx.fillRect(bx - 60, by - 60, 120, 120); ctx.restore()
    for (const c of coals) {
      const f = 0.5 + 0.5 * Math.sin(t * (2.5 + c.s * 2) + c.ph)
      const heat = Math.max(0, 1 - Math.hypot(c.x / 44, c.y / 17)) * 0.6 + f * 0.4
      ctx.font = `700 ${Math.round(8 + c.s * 4)}px ${MONO}`
      ctx.fillStyle = heat > 0.55 ? `rgba(255,${(150 + heat * 80) | 0},70,${0.6 + heat * 0.4})` : `rgba(${(120 + heat * 160) | 0},${(40 + heat * 40) | 0},25,0.85)`
      ctx.fillText(c.ch, bx + c.x, by + c.y)
    }
    ctx.font = `800 14px ${MONO}`
    logs.forEach(([x0, y0, x1, y1], li) => {
      const steps = Math.round(Math.hypot(x1 - x0, y1 - y0) / 5)
      for (let i = 0; i <= steps; i++) {
        const u = i / steps, x = bx + x0 + (x1 - x0) * u, y = by - 4 + y0 + (y1 - y0) * u
        const glow = 0.5 + 0.5 * Math.sin(t * 6 + i * 1.3 + li * 2.1), mid = 1 - Math.abs(u - 0.5) * 2
        ctx.fillStyle = 'rgba(46,32,24,0.95)'; ctx.fillText(i % 3 === 0 ? '#' : '=', x, y)
        if (mid > 0.3 && glow > 0.55) { ctx.fillStyle = `rgba(255,${(120 + glow * 90) | 0},40,${(glow - 0.4) * mid})`; ctx.fillText(i % 2 ? '~' : '-', x, y + 1) }
      }
    })
  }

  const spawn = (kind: Particle['kind']) => {
    if (kind === 'flame') parts.push({ x: bx + (rand() - 0.5) * 38, y: by, vx: (rand() - 0.5) * 14, vy: -(45 + rand() * 55), life: 0, max: 0.45 + rand() * 0.55, kind })
    else if (kind === 'smoke') parts.push({ x: bx + (rand() - 0.5) * 20, y: by - 40, vx: (rand() - 0.5) * 8, vy: -(18 + rand() * 12), life: 0, max: 2.5 + rand() * 1.5, kind })
    else parts.push({ x: bx + (rand() - 0.5) * 20, y: by - 10, vx: (rand() - 0.5) * 60, vy: -(110 + rand() * 90), life: 0, max: 0.6 + rand() * 0.6, kind })
  }

  return {
    mesh,
    update(dt, t, camera, at) {
      ctx.clearRect(0, 0, W, H)
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      drawBase(t)
      for (const k of ['flame', 'smoke', 'ember'] as const) {
        owed[k] += RATE[k] * dt
        while (owed[k] >= 1) { spawn(k); owed[k]-- }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.life += dt
        if (p.life > p.max) { parts.splice(i, 1); continue }
        const k = p.life / p.max
        p.x += (p.vx + Math.sin(t * 7 + p.y * 0.08) * 12) * dt; p.y += p.vy * dt
        if (p.kind === 'flame') {
          p.x += (bx - p.x) * dt * 1.6                       // flames pull to a point
          const ch = k < 0.2 ? '@' : k < 0.4 ? '#' : k < 0.6 ? '*' : k < 0.8 ? '^' : "'"
          const col = k < 0.25 ? '255,221,120' : k < 0.55 ? '246,140,46' : k < 0.8 ? '214,72,30' : '150,50,30'
          ctx.font = `700 ${Math.round(15 - k * 6)}px ${MONO}`
          ctx.fillStyle = `rgba(${col},${1 - k * 0.6})`; ctx.fillText(ch, p.x, p.y)
        } else if (p.kind === 'smoke') {
          ctx.font = `600 ${Math.round(10 + k * 8)}px ${MONO}`
          ctx.fillStyle = `rgba(110,100,92,${0.28 * (1 - k)})`; ctx.fillText(k < 0.5 ? 'o' : '°', p.x, p.y)
        } else {
          ctx.font = `700 9px ${MONO}`
          ctx.fillStyle = `rgba(255,180,80,${1 - k})`; ctx.fillText(k < 0.5 ? '*' : '.', p.x, p.y)
        }
      }
      tex.needsUpdate = true
      const [fx, fy] = camera.worldToScreen(at.x, 0, at.z)
      const sc = (camera.pz / 100) * 1.05, w = W * sc, h = H * sc
      mesh.scale.set(w, h, 1)
      mesh.position.set(fx, camera.height - (fy - h / 2 + 34 * sc), 0)
      mesh.renderOrder = fy + 0.5
    },
    dispose() { tex.dispose(); (mesh.material as THREE.Material).dispose(); mesh.geometry.dispose() },
  }
}
