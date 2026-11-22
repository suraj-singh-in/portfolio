import type { Vec2 } from '../core/types'
import type { Camera } from './camera'
import type { DrawItem } from './compositor'
import type { Track } from '../world/track'

/** a lake band: water from the waterline (z = shoreZ(x)) out to farZ, across |x| <= half (world metres) */
export type Water = { shoreZ: (x: number) => number; farZ: number; half: number }

export type Paper = {
  resize(w: number, h: number, dpr: number): void
  /** paper + grain, worn ground patches, still water, soft ground shadows, firelight pool */
  draw(camera: Camera, items: readonly DrawItem[], worn: readonly [Vec2, number, number][], fire: Vec2, t: number, water?: Water, trail?: Track): void
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
  /** a faint trodden line up the middle of a track, so the way reads among the rocks */
  const drawTrail = (camera: Camera, tr: Track) => {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    let prev = camera.worldToScreen(tr.points[0].x, 0, tr.points[0].z)
    for (let i = 1; i < tr.points.length; i++) {
      const p = tr.points[i], cur = camera.worldToScreen(p.x, 0, p.z)
      const onScreen = Math.max(prev[0], cur[0]) > -60 && Math.min(prev[0], cur[0]) < W + 60 && Math.max(prev[1], cur[1]) > -60 && Math.min(prev[1], cur[1]) < H + 60
      if (onScreen) {
        const hw = tr.halfWidth(i * tr.step) * camera.pz
        ctx.strokeStyle = 'rgba(126,104,78,.10)'; ctx.lineWidth = hw * 1.1
        ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(cur[0], cur[1]); ctx.stroke()
        ctx.strokeStyle = 'rgba(110,90,66,.10)'; ctx.lineWidth = Math.min(hw * 0.45, camera.pz * 1.1)
        ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(cur[0], cur[1]); ctx.stroke()
      }
      prev = cur
    }
    ctx.restore()
  }

  /** a pale, cool paper wash under the lake band — the waves themselves are ASCII (render/water.ts) */
  const drawWater = (camera: Camera, w: Water) => {
    const pts: [number, number][] = []
    for (let x = -w.half; x <= w.half; x += 1.5) pts.push(camera.worldToScreen(x, 0, w.shoreZ(x)))
    const [, top] = camera.worldToScreen(0, 0, w.farZ - 1)
    if (pts.every(([, y]) => y < 0) || top > H) return
    const g = ctx.createLinearGradient(0, top, 0, Math.max(...pts.map(([, y]) => y)))   // colder toward the mountains
    g.addColorStop(0, 'rgba(178,194,198,.9)'); g.addColorStop(1, 'rgba(216,226,226,.9)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.moveTo(pts[0][0], top)
    for (const [x, y] of pts) ctx.lineTo(x, y)
    ctx.lineTo(pts[pts.length - 1][0], top); ctx.closePath(); ctx.fill()
  }

  return {
    resize(w, h, dpr) { W = w; H = h; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) },
    draw(camera, items, worn, fire, t, water, trail) {
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
      if (water) drawWater(camera, water)
      if (trail) drawTrail(camera, trail)
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
