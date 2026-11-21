import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { ASSETS, assetUrl, type SpriteMeta } from './assets/manifest'
import { loadAll } from './assets/loader'
import { createAudio, type AudioController } from './audio/audio'
import { CONFIG } from './config'
import { createEvents } from './core/events'
import { createLoop } from './core/loop'
import { pickTier } from './core/quality'
import { mulberry32 } from './core/rng'
import type { Vec2 } from './core/types'
import { createHorse, horseLookAngle, strokeHorse, updateHorse } from './entities/horse'
import { createCaptions, inStrokeRange, neckPoint } from './entities/interaction'
import { createPlayer, faceToward, updatePlayer } from './entities/player'
import { createInput } from './input/input'
import { createCamera } from './render/camera'
import { prepareHero, prepareHorse } from './render/characters'
import { createCompositor, type DrawItem } from './render/compositor'
import { createFire } from './render/fire'
import { createGlyphAtlas } from './render/glyphAtlas'
import { cachedMaterial, type GlyphOpts } from './render/glyphMaterial'
import { createGrass } from './render/grass'
import { buildGrassField } from './render/grassField'
import { createLiveSource } from './render/liveSource'
import { createPaper } from './render/paper'
import { createSceneryBaker } from './render/sceneryBaker'
import { createTrample } from './render/trample'
import { LAYOUT } from './world/clearing'
import { scatterWorld } from './world/scatter'

export type EngineEvents = {
  /** asset loading 0 → 1 */
  progress: number
  /** first frame rendered */
  ready: true
  caption: string
  /** interact prompt visible */
  prompt: boolean
  mute: boolean
  /** hero name label position (CSS px) and opacity */
  name: { x: number; y: number; opacity: number }
  error: string
  /** debug overlay text (only with debug) */
  stats: string
}

export type Engine = {
  start(): Promise<void>
  dispose(): void
  on: ReturnType<typeof createEvents<EngineEvents>>['on']
}

type SceneryItem = DrawItem & { sprite: string; scale: number; cell: [number, number]; glyph: Partial<GlyphOpts>; ax: number; ay: number; pxW: number; pxH: number }

const TREE_LOOK: Partial<GlyphOpts> = { tint: 0.78, ink: '#17241a', contrast: 1.8, mid: 0.5, wash: 0.42 }
const UNDER_LOOK: Partial<GlyphOpts> = { tint: 0.8, ink: '#18281a', contrast: 1.8, mid: 0.5, wash: 0.4 }

export function createEngine(canvases: { gl: HTMLCanvasElement; paper: HTMLCanvasElement }, opts: { quality?: string | null; debug: boolean }): Engine {
  const events = createEvents<EngineEvents>()
  const cleanups: (() => void)[] = []
  let disposed = false
  let dispose = () => { disposed = true }

  async function start() {
    const renderer = new THREE.WebGLRenderer({ canvas: canvases.gl, alpha: true, antialias: false, premultipliedAlpha: false })
    cleanups.push(() => { renderer.dispose(); renderer.forceContextLoss() })
    renderer.setClearColor(0x000000, 0)
    const onLost = (e: Event) => { e.preventDefault(); events.emit('error', 'The graphics context was lost. Reload the page to continue.') }
    canvases.gl.addEventListener('webglcontextlost', onLost)
    cleanups.push(() => canvases.gl.removeEventListener('webglcontextlost', onLost))

    // ---------- assets ----------
    const gltf = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
    const texLoader = new THREE.TextureLoader()
    const manifest: Record<string, SpriteMeta> = await (await fetch(assetUrl(ASSETS.sprites))).json()
    const loadTex = (file: string) => new Promise<THREE.Texture>((res, rej) => texLoader.load(assetUrl(`sprites/${file}`), (t) => {
      t.colorSpace = THREE.NoColorSpace; t.premultiplyAlpha = false; t.anisotropy = 4; res(t)
    }, undefined, rej))
    const audioOk = (path: string) => () => fetch(assetUrl(path), { method: 'HEAD' }).then((r) => { if (!r.ok) throw new Error(path); return true })
    const loaded = await loadAll({
      sprites: async () => Object.fromEntries(await Promise.all(Object.entries(manifest).map(async ([k, m]) => [k, await loadTex(m.file)] as const))),
      hero: () => gltf.loadAsync(assetUrl(ASSETS.hero)),
      horse: () => gltf.loadAsync(assetUrl(ASSETS.horse)),
      ambience: audioOk(ASSETS.ambience),
      step: audioOk(ASSETS.step),
    }, ['ambience', 'step'], (p) => events.emit('progress', p))
    if (disposed) { cleanups.forEach((f) => f()); return }
    const sprites = loaded.sprites!
    cleanups.push(() => Object.values(sprites).forEach((t) => t.dispose()))

    // ---------- world ----------
    const rand = mulberry32(CONFIG.SEED)
    const world = scatterWorld(CONFIG.SEED)
    const field = buildGrassField(world)
    const camera = createCamera()
    const atlas = createGlyphAtlas()
    cleanups.push(() => atlas.texture.dispose())
    const baker = createSceneryBaker(renderer, atlas, sprites, manifest)
    cleanups.push(() => baker.dispose())
    const compositor = createCompositor(renderer)
    cleanups.push(() => compositor.dispose())
    const paper = createPaper(canvases.paper, rand)
    const trample = createTrample()
    cleanups.push(() => trample.texture.dispose())

    const gl = renderer.getContext()
    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    const gpu = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : ''
    let tier = pickTier({ renderer: gpu, frameMs: 0 }, opts.quality)
    const grass = createGrass({ count: tier.grass, world, field, trample })
    cleanups.push(() => grass.dispose())
    compositor.scene.add(grass.mesh)
    const fire = createFire(rand)
    cleanups.push(() => fire.dispose())
    compositor.scene.add(fire.mesh)

    // scenery
    const scenery: SceneryItem[] = []
    const addScenery = (sprite: string, at: Vec2, scale: number, cell: [number, number], glyph: Partial<GlyphOpts>, shadow: number, isTree: boolean) => {
      if (!manifest[sprite]) return
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), cachedMaterial(glyph.sway ?? 0, rand() * 6.28))
      const item: SceneryItem = {
        mesh, world: at, isTree, shadow, vis: false, fade: 1, sprite, scale, cell, glyph, ax: 0, ay: 0, pxW: 1, pxH: 1,
        rect(c) { const [gx, gy] = c.worldToScreen(at.x, 0, at.z); const z = c.zoom; return { left: Math.round(gx - item.ax * z), top: Math.round(gy - item.ay * z), w: item.pxW * z, h: item.pxH * z } },
      }
      scenery.push(item); compositor.add(item)
      cleanups.push(() => { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose() })
    }
    addScenery('hut', LAYOUT.hut, 1, [3.5, 5.25], { solid: true, tint: 0.62, wash: 0.3 }, 3.0, false)
    addScenery('firepit', LAYOUT.fire, 1, [3, 4.5], { solid: true, tint: 0.5, wash: 0.12, contrast: 3.2, mid: 0.52 }, 0, false)
    addScenery('gnarled', LAYOUT.gnarled, 1, [4, 6], { ...TREE_LOOK, sway: 0.01 }, 2.2, true)
    addScenery('log', LAYOUT.log, 1, [4, 6], { solid: true, tint: 0.45 }, 0.8, false)
    for (const t of world.trees) addScenery(t.sprite, t, t.scale, [4, 6], { ...TREE_LOOK, sway: t.sway }, 1.6, true)
    for (const u of world.undergrowth) addScenery(u.sprite, u, u.scale, [3, 4.5], { ...UNDER_LOOK, sway: u.sway }, 0.4, false)
    for (const r of world.rocks) addScenery(r.sprite, r, r.scale, [3, 4.5], { solid: true, tint: 0.4 }, 0.7 * r.scale, false)

    // characters
    const heroGltf = loaded.hero!, horseGltf = loaded.horse!
    const hero = prepareHero(heroGltf.scene, heroGltf.animations)
    const heroPivot = new THREE.Group(); heroPivot.add(hero.root)
    const heroSrc = createLiveSource(renderer, camera, atlas, heroPivot, {
      box: new THREE.Box3(new THREE.Vector3(-0.55, 0, -0.55), new THREE.Vector3(0.55, 1.85, 0.55)), margin: 1.25,
      grid: [...CONFIG.HERO_GRID] as [number, number], cell: [3, 4.5], glyph: { tint: 0.34, solid: true },
    })
    cleanups.push(() => heroSrc.dispose())
    const horse = prepareHorse(horseGltf.scene, horseGltf.animations)
    const horseFacing = Math.atan2(-1, -0.35)
    horse.root.rotation.y = horseFacing - horse.forward0
    const horsePivot = new THREE.Group(); horsePivot.add(horse.root)
    const horseSrc = createLiveSource(renderer, camera, atlas, horsePivot, {
      box: new THREE.Box3(new THREE.Vector3(-1.3, 0, -1.3), new THREE.Vector3(1.3, 2.1, 1.3)), margin: 1.1,
      cell: [3, 4.5], glyph: { tint: 0.36, solid: true },
    })
    cleanups.push(() => horseSrc.dispose())
    let player = createPlayer()
    let horseState = createHorse()
    let look = 0
    const playerItem: DrawItem = { mesh: heroSrc.quad, world: { x: player.x, z: player.z }, isTree: false, shadow: 0.55, vis: false, fade: 1, rect: (c) => heroSrc.rect(c, playerItem.world) }
    const horseItem: DrawItem = { mesh: horseSrc.quad, world: LAYOUT.horse, isTree: false, shadow: 1.4, vis: false, fade: 1, rect: (c) => horseSrc.rect(c, LAYOUT.horse) }
    compositor.add(playerItem); compositor.add(horseItem)
    hero.play('Idle', 0); horse.play('Eating', 0)

    // ---------- audio + input ----------
    let audio: AudioController | null = null
    if (loaded.ambience && loaded.step) {
      audio = createAudio({ ambienceUrl: assetUrl(ASSETS.ambience), stepUrl: assetUrl(ASSETS.step), make: (u) => new Audio(u), storage: window.localStorage })
      cleanups.push(() => audio?.dispose())
      const unlock = () => audio?.unlock()
      window.addEventListener('keydown', unlock); window.addEventListener('pointerdown', unlock)
      cleanups.push(() => { window.removeEventListener('keydown', unlock); window.removeEventListener('pointerdown', unlock) })
      events.emit('mute', audio.isMuted())
    }
    const input = createInput(window, { debug: opts.debug })
    cleanups.push(() => input.dispose())
    let zoomStep: -1 | 0 | 1 = 0
    const captions = createCaptions()
    let sceneScale: number = CONFIG.SCENERY_SYMBOL_SCALE, raw = false
    input.onPress('zoomIn', () => { zoomStep = 1 })
    input.onPress('zoomOut', () => { zoomStep = -1 })
    input.onPress('mute', () => { if (audio) events.emit('mute', audio.toggleMute()) })
    let clock = 0
    input.onPress('interact', () => {
      if (player.mode !== 'free' || !inStrokeRange(player, LAYOUT.horse)) return
      player = faceToward(player, neckPoint(LAYOUT.horse, horseFacing), clock)
      horseState = strokeHorse(horseState, clock)
      events.emit('caption', captions.next())
    })

    // ---------- layout ----------
    const layout = () => {
      const w = window.innerWidth, h = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, CONFIG.MAX_DPR)
      camera.setViewport(w, h)
      renderer.setPixelRatio(dpr); renderer.setSize(w, h, false)
      paper.resize(w, h, dpr)
      compositor.setViewport(w, h)
      baker.setLayout(camera.ppu, dpr, sceneScale, raw)
      for (const s of scenery) {
        const b = baker.bake(s.sprite, s.scale, s.cell, s.glyph)
        s.pxW = b.pxW; s.pxH = b.pxH; s.ax = b.ax; s.ay = b.ay
        ;(s.mesh.material as THREE.ShaderMaterial).uniforms.map.value = b.texture
      }
      heroSrc.layout(camera.ppu, 1)
      horseSrc.layout(camera.ppu, CONFIG.HORSE_SYMBOL_SCALE)
      heroSrc.material.uniforms.mode.value = horseSrc.material.uniforms.mode.value = raw ? 1 : 0
    }
    layout()
    window.addEventListener('resize', layout)
    cleanups.push(() => window.removeEventListener('resize', layout))
    camera.snap(player)

    if (opts.debug) {
      input.onPress('debugRaw', () => { raw = !raw; layout() })
      input.onPress('debugSceneryDown', () => { sceneScale = Math.max(0.5, sceneScale - 0.25); layout() })
      input.onPress('debugSceneryUp', () => { sceneScale = Math.min(3, sceneScale + 0.25); layout() })
      const w = window as unknown as { setGrass?: (n: number) => string }
      w.setGrass = (n: number) => { grass.setCount(Math.min(6_000_000, n)); return `grass: ${grass.count.toLocaleString()} blades` }
      cleanups.push(() => { delete w.setGrass })
    }

    // ---------- frame ----------
    let prompt = false, readySent = false, nameOpacity = -1, frames = 0, probeMs = 0, lastNow = performance.now(), fpsT = 0, fpsN = 0
    const step = (dt: number, t: number) => {
      clock = t
      const now = performance.now(), frameMs = now - lastNow; lastNow = now
      if (frames < 120) { frames++; if (frames > 30) probeMs += frameMs }
      if (frames === 120) {        // one-time downgrade if the machine is struggling
        frames++
        const probed = pickTier({ renderer: gpu, frameMs: probeMs / 89 }, opts.quality)
        if (opts.debug) console.info('[lore] quality probe', (probeMs / 89).toFixed(1), 'ms →', probed.name)
        if (probed.grass < tier.grass) { tier = probed; grass.setCount(tier.grass) }
      }

      const move = input.moveVector()
      player = updatePlayer(player, move, dt, t, world.obstacles)
      playerItem.world.x = player.x; playerItem.world.z = player.z
      trample.stamp(player.x, player.z, Math.sin(player.facing), Math.cos(player.facing), player.moving ? (player.running ? 1.1 : 0.8) * dt * 9 : dt * 1.5, player.moving ? 0.42 : 0.32)
      trample.update(dt)
      audio?.step(dt, player.moving, player.running)
      hero.play(player.mode === 'stroke' ? 'Interact' : player.moving ? (player.running ? 'Run' : 'Walk') : 'Idle', player.moving ? 0.2 : 0.3)
      hero.root.rotation.y = player.facing
      hero.mixer.update(dt)
      heroSrc.fireLight.position.set(LAYOUT.fire.x - player.x, 0.9, LAYOUT.fire.z - player.z)
      heroSrc.fireLight.intensity = 5 + Math.sin(t * 17) * 0.9 + Math.sin(t * 7.3) * 0.7

      const dh = Math.hypot(player.x - LAYOUT.horse.x, player.z - LAYOUT.horse.z)
      horseState = updateHorse(horseState, dh, t, rand)
      horse.play(horseState.clip, horseState.mode === 'graze' ? 0.8 : 0.6)
      horse.mixer.update(dt)
      look += (horseLookAngle(horseFacing, LAYOUT.horse, player, horseState.mode) - look) * Math.min(1, dt * 2.5)
      horse.applyLook(look)
      horseSrc.fireLight.position.set(LAYOUT.fire.x - LAYOUT.horse.x, 0.9, LAYOUT.fire.z - LAYOUT.horse.z)
      horseSrc.fireLight.intensity = 3 + Math.sin(t * 15) * 0.6

      const p = player.mode === 'free' && inStrokeRange(player, LAYOUT.horse)
      if (p !== prompt) { prompt = p; events.emit('prompt', p) }

      camera.update(dt, player, input.takeWheel(), zoomStep); zoomStep = 0
      paper.draw(camera, compositor.items, [[LAYOUT.fire, 3.2, 0.09], [{ x: LAYOUT.hut.x + 0.5, z: LAYOUT.hut.z + 2.4 }, 2.6, 0.07], [LAYOUT.horse, 2.2, 0.05]], LAYOUT.fire, t)
      heroSrc.render(); horseSrc.render()
      fire.update(dt, t, camera, LAYOUT.fire)
      grass.update(camera, t, player, LAYOUT.horse)
      compositor.draw(camera, player, t, dt)

      const op = Math.min(1, Math.max(0, (camera.zoom - 1.45) / 0.2))
      if (op > 0 || Math.abs(op - nameOpacity) > 0.01) {
        nameOpacity = op
        const [nx, ny] = camera.worldToScreen(player.x, 2.05, player.z)
        events.emit('name', { x: nx, y: ny, opacity: op })
      }
      if (!readySent) { readySent = true; events.emit('ready', true) }
      if (opts.debug) {
        fpsN++; fpsT += dt
        if (fpsT > 0.5) { events.emit('stats', `${Math.round(fpsN / fpsT)} fps · ${grass.count.toLocaleString()} grass (${tier.name}) · hero ${heroSrc.grid.join('×')} · zoom ${camera.zoom.toFixed(2)} · scenery ${sceneScale}× · ${gpu}`); fpsN = 0; fpsT = 0 }
      }
    }
    const loop = createLoop(step, { raf: (cb) => window.requestAnimationFrame(cb), caf: (id) => window.cancelAnimationFrame(id), doc: document })
    cleanups.push(() => loop.stop())
    loop.start()

    dispose = () => {
      if (disposed) return
      disposed = true
      for (const f of cleanups.reverse()) { try { f() } catch { /* keep disposing */ } }
      events.clear()
    }
  }

  return {
    start,
    dispose: () => dispose(),
    on: events.on,
  }
}
