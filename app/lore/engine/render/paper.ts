import type { Vec2 } from '../core/types'
import type { Camera } from './camera'
import type { DrawItem } from './compositor'

export type Paper = {
  resize(w: number, h: number, dpr: number): void
  /** paper + grain, worn ground patches, soft ground shadows, firelight pool */
  draw(camera: Camera, items: readonly DrawItem[], worn: readonly [Vec2, number, number][], fire: Vec2, t: number): void
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

  return {
    resize(w, h, dpr) { W = w; H = h; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) },
    draw(camera, items, worn, fire, t) {
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
