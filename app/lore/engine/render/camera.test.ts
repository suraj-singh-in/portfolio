import { describe, expect, it } from 'vitest'
import { createCamera } from './camera'

describe('camera', () => {
  it('starts at 0.9 zoom', () => {
    expect(createCamera().zoom).toBeCloseTo(0.9)
  })

  it('maps the followed point to the viewport centre', () => {
    const c = createCamera()
    c.setViewport(1600, 800)
    for (let i = 0; i < 400; i++) c.update(0.05, { x: 3, z: -2 }, 0, 0)
    const [sx, sy] = c.worldToScreen(3, 0, -2)
    expect(sx).toBeCloseTo(800, 0)
    expect(sy).toBeCloseTo(400, 0)
  })

  it('clamps zoom to [0.8, 1.7] after large wheel input', () => {
    const c = createCamera()
    c.setViewport(1600, 800)
    for (let i = 0; i < 200; i++) c.update(0.05, { x: 0, z: 0 }, -300, 0)
    expect(c.zoom).toBeCloseTo(1.7, 3)
    for (let i = 0; i < 200; i++) c.update(0.05, { x: 0, z: 0 }, 300, 0)
    expect(c.zoom).toBeCloseTo(0.8, 3)
  })

  it('a fast burst of wheel input in one frame still reaches max zoom', () => {
    const c = createCamera()
    c.setViewport(1600, 800)
    c.update(0.016, { x: 0, z: 0 }, -2400, 0)
    for (let i = 0; i < 200; i++) c.update(0.05, { x: 0, z: 0 }, 0, 0)
    expect(c.zoom).toBeCloseTo(1.7, 3)
  })

  it('eases toward the target zoom instead of jumping', () => {
    const c = createCamera()
    c.setViewport(1600, 800)
    c.update(0.016, { x: 0, z: 0 }, 0, 1)
    expect(c.zoom).toBeGreaterThan(0.9)
    expect(c.zoom).toBeLessThan(0.99)
  })

  it('derives pixels-per-metre from viewport height', () => {
    const c = createCamera()
    c.setViewport(1600, 800)
    expect(c.ppu).toBe(100)
    expect(c.pz).toBeCloseTo(90)
  })
})
