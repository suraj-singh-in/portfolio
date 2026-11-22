import type { Vec2 } from '../core/types'
import type { Camera } from './camera'
import type { DrawItem } from './compositor'

/** still water: an axis-aligned ellipse on the ground (world metres) */
export type Water = { x: number; z: number; rx: number; rz: number }

export type Paper = {
  resize(w: number, h: number, dpr: number): void
  /** paper + grain, worn ground patches, still water, soft ground shadows, firelight pool */
  draw(camera: Camera, items: readonly DrawItem[], worn: readonly [Vec2, number, number][], fire: Vec2, t: number, water?: Water): void
}

export function createPaper(canvas: HTMLCanvasElement, rand: () => number): Paper {
  const ctx = canvas.getContext('2d')!
  const grain = document.createElement('canvas')
  grain.width = grain.height = 256
  const g = grain.getContext('2d')!
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(80,70,50,${rand() * 0.05})`; g.fillRect(rand() * 256, rand() * 256, 1 + rand() * 1.5, 1) }
  const stamp = document.createElement('canvas')
  stamp.width = stamp.height = 128
  const s = stamp.getContext('2d')!
  const gr = s.createRadialGradient(64, 64, 4, 64, 64, 64)
  gr.addColorStop(0, 'rgba(70,58,44,.28)'); gr.addColorStop(1, 'rgba(70,58,44,0)')
  s.fillStyle = gr; s.fillRect(0, 0, 128, 128)
  let W = 1, H = 1
  // ripple strokes: fixed places on the water (unit-disc coords), each drifting and breathing slowly
  const ripples = Array.from({ length: 70 }, () => { const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 0.92; return { u: Math.cos(a) * r, v: Math.sin(a) * r, len: 0.5 + rand() * 1.4, ph: rand() * 6.28, sp: 0.15 + rand() * 0.25 } })

  /** cool, pale water with a soft rim and short ink ripples — like the inspiration lakes, in our paper tones */
  const drawWater = (camera: Camera, w: Water, t: number) => {
    const [cx, cy] = camera.worldToScreen(w.x, 0, w.z)
    const [ex] = camera.worldToScreen(w.x + w.rx, 0, w.z), [, ey] = camera.worldToScreen(w.x, 0, w.z + w.rz)
    const rx = Math.abs(ex - cx), ry = Math.abs(ey - cy)
    if (cx + rx < 0 || cx - rx > W || cy + ry < 0 || cy - ry > H) return
    ctx.save()
    ctx.fillStyle = 'rgba(150,168,170,.18)'   // damp rim
    ctx.beginPath(); ctx.ellipse(cx, cy, rx + 6, ry + 5, 0, 0, Math.PI * 2); ctx.fill()
    const g = ctx.createLinearGradient(0, cy - ry, 0, cy + ry)   // deeper and colder toward the mountains
    g.addColorStop(0, 'rgba(120,140,146,.95)'); g.addColorStop(1, 'rgba(196,210,210,.95)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill()
    ctx.clip()
    ctx.lineWidth = 1; ctx.lineCap = 'round'
    for (const r of ripples) {
      const drift = Math.sin(t * r.sp + r.ph) * 0.06
      const x = cx + (r.u + drift) * rx, y = cy + r.v * ry, half = (r.len * camera.pz) / 2
      const a = 0.12 + 0.16 * (0.5 + 0.5 * Math.sin(t * 0.7 + r.ph * 2))
      ctx.strokeStyle = `rgba(60,78,84,${a.toFixed(3)})`
      ctx.beginPath(); ctx.moveTo(x - half, y); ctx.lineTo(x + half, y); ctx.stroke()
    }
    ctx.restore()
  }

  return {
    resize(w, h, dpr) { W = w; H = h; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) },
    draw(camera, items, worn, fire, t, water) {
      const PZ = camera.pz
      ctx.fillStyle = '#fbfaf6'; ctx.fillRect(0, 0, W, H)
      const [ox, oy] = camera.worldToScreen(0, 0, 0)
      ctx.save(); ctx.translate((ox % 256) - 256, (oy % 256) - 256)
      ctx.fillStyle = ctx.createPattern(grain, 'repeat')!; ctx.fillRect(0, 0, W + 512, H + 512); ctx.restore()
      for (const [p, r, a] of worn) {
        const [cx, cy] = camera.worldToScreen(p.x, 0, p.z)
        const eg = ctx.createRadialGradient(cx, cy, 0, cx, cy, PZ * r)
        eg.addColorStop(0, `rgba(140,118,88,${a})`); eg.addColorStop(1, 'rgba(140,118,88,0)')
        ctx.fillStyle = eg; ctx.fillRect(cx - PZ * r, cy - PZ * r, PZ * r * 2, PZ * r * 2)
      }
      if (water) drawWater(camera, water, t)
      for (const it of items) {
        if (!it.vis || !it.shadow) continue
        const [sx, sy] = camera.worldToScreen(it.world.x + 0.4 * it.shadow, 0, it.world.z + 0.3 * it.shadow)
        const r = it.shadow * PZ * (it.isTree ? 1.3 : 1.05)
        ctx.drawImage(stamp, sx - r, sy - r * 0.42, r * 2, r * 0.84)
      }
      const [fx, fy] = camera.worldToScreen(fire.x, 0, fire.z)
      const fl = 1 + Math.sin(t * 13) * 0.06 + Math.sin(t * 5.1) * 0.05
      const fg = ctx.createRadialGradient(fx, fy, 2, fx, fy, PZ * 3 * fl)
      fg.addColorStop(0, 'rgba(255,150,70,.32)'); fg.addColorStop(0.5, 'rgba(255,150,70,.10)'); fg.addColorStop(1, 'rgba(255,150,70,0)')
      ctx.fillStyle = fg; ctx.fillRect(fx - PZ * 3.5, fy - PZ * 3.5, PZ * 7, PZ * 7)
    },
  }
}
