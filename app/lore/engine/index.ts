import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { ASSETS, assetUrl, type SpriteMeta } from './assets/manifest'
import { loadAll } from './assets/loader'
import { createAudio, type AudioController } from './audio/audio'
import { CONFIG } from './config'
import { createEvents } from './core/events'
import { createLoop } from './core/loop'
import { safeStorage } from './core/safeStorage'
import { createTeardown } from './core/teardown'
import { trailingDebounce } from './core/debounce'
import { pickTier } from './core/quality'
import { mulberry32 } from './core/rng'
import type { Vec2 } from './core/types'
import { createHorse, horseLookAngle, reactionSide, strokeHorse, updateHorse } from './entities/horse'
import { createCaptions, inStrokeRange, neckPoint } from './entities/interaction'
import { createPlayer, faceToward, updatePlayer } from './entities/player'
import { createRide, sidePoint, toggleMount, updateRide } from './entities/ride'
import { createInput } from './input/input'
import { createCamera } from './render/camera'
import { prepareHero, prepareHorse, stripRootTracks } from './render/characters'
import { createCompositor, type DrawItem } from './render/compositor'
import { createFire } from './render/fire'
import { createGlyphAtlas } from './render/glyphAtlas'
import { cachedMaterial, type GlyphOpts } from './render/glyphMaterial'
import { createGrass } from './render/grass'
import { FIELD, buildGrassFieldAsync, type GrassField } from './render/grassField'
import type { FieldWorkerIn, FieldWorkerOut } from './render/fieldWorker'
import { createLiveSource } from './render/liveSource'
import { createPaper } from './render/paper'
import { createSceneryBaker } from './render/sceneryBaker'
import { createTrample } from './render/trample'
import { LAYOUT } from './world/clearing'
import { GATE_PATH, PEOPLE, STONE_WALL_SEGMENTS, WALL, createWallCaption } from './world/road'
import { LAKE, MOUNTAINS, createLakeCaption, lookAhead } from './world/north'
import { scatterWorld } from './world/scatter'

export type EngineEvents = {
  /** asset loading 0 → 1 */
  progress: number
  /** first frame rendered */
  ready: true
  caption: string
  /** interact prompt: mount, dismount, or hidden */
  prompt: 'ride' | 'dismount' | null
  mute: boolean
  /** hero name label position (CSS px) and opacity */
  name: { x: number; y: number; opacity: number }
  error: string
  /** debug overlay text (only with debug) */
  stats: string
  /** ambience playing, or waiting for a click/key because the browser blocked autoplay */
  sound: 'on' | 'blocked'
}

export type Engine = {
  start(): Promise<void>
  dispose(): void
  on: ReturnType<typeof createEvents<EngineEvents>>['on']
}

type SceneryItem = DrawItem & { sprite: string; scale: number; cell: [number, number]; glyph: Partial<GlyphOpts>; ax: number; ay: number; pxW: number; pxH: number }

const TREE_LOOK: Partial<GlyphOpts> = { tint: 0.78, ink: '#17241a', contrast: 1.8, mid: 0.5, wash: 0.42 }
const UNDER_LOOK: Partial<GlyphOpts> = { tint: 0.8, ink: '#18281a', contrast: 1.8, mid: 0.5, wash: 0.4 }

/** The meadow field is deterministic from the seed, so restarts (narrow→wide, revisits) reuse it. */
let fieldCache: { seed: number; field: GrassField } | null = null
const nextTick = () => new Promise<void>((r) => setTimeout(r, 0))
/** Bake scenery at a few fixed sizes and stretch the quad for the rest: far fewer bakes, same look. */
const bakeScale = (scale: number) => Math.max(0.5, Math.round(scale * 2) / 2)

export function createEngine(canvases: { gl: HTMLCanvasElement; paper: HTMLCanvasElement }, opts: { quality?: string | null; debug: boolean }): Engine {
  const events = createEvents<EngineEvents>()
  const teardown = createTeardown()
  const cleanups = { push: (fn: () => void) => teardown.add(fn) }
  const dispose = () => { teardown.run(); events.clear() }

  async function start() {
    try { await run() } catch (e) { dispose(); throw e }
  }

  async function run() {
    const renderer = new THREE.WebGLRenderer({ canvas: canvases.gl, alpha: true, antialias: false, premultipliedAlpha: false })
    cleanups.push(() => { renderer.dispose(); renderer.forceContextLoss() })
    renderer.setClearColor(0x000000, 0)
    const onLost = (e: Event) => { e.preventDefault(); events.emit('error', 'The graphics context was lost. Reload the page to continue.') }
    canvases.gl.addEventListener('webglcontextlost', onLost)
    cleanups.push(() => canvases.gl.removeEventListener('webglcontextlost', onLost))

    // ---------- audio first: the forest should be heard during the loading screen ----------
    const audio: AudioController = createAudio({
      ambienceUrl: assetUrl(ASSETS.ambience), stepUrl: assetUrl(ASSETS.step), snortUrl: assetUrl(ASSETS.snort), make: (u) => new Audio(u),
      storage: safeStorage(() => window.localStorage), onState: (st) => events.emit('sound', st),
    })
    cleanups.push(() => audio.dispose())
    const unlock = () => audio.unlock()
    window.addEventListener('keydown', unlock); window.addEventListener('pointerdown', unlock)
    cleanups.push(() => { window.removeEventListener('keydown', unlock); window.removeEventListener('pointerdown', unlock) })
    events.emit('mute', audio.isMuted())
    audio.unlock()   // works when the visitor arrived by clicking (e.g. the nav link); otherwise waits for a gesture

    // ---------- grass field: built in a worker while the assets download ----------
    // loading waits only for the rows around the spawn; the far rows arrive while you play
    let fieldDone: Promise<void> = Promise.resolve()
    let fieldNear: Promise<GrassField | null> = Promise.resolve(null)
    if (fieldCache?.seed === CONFIG.SEED) fieldNear = Promise.resolve(fieldCache.field)
    else {
      let worker: Worker | null = null
      try { worker = new Worker(new URL('./render/fieldWorker.ts', import.meta.url), { type: 'module' }) } catch { worker = null }
      if (worker) {
        const w = worker
        cleanups.push(() => w.terminate())
        const built: GrassField = { data: new Uint8Array(FIELD.w * FIELD.h * 4), meanAcceptance: 0 }
        let resolveAll: () => void = () => {}
        fieldDone = new Promise<void>((r) => { resolveAll = r })
        fieldNear = new Promise<GrassField | null>((near) => {
          w.onerror = (err) => { err.preventDefault(); near(null) }   // fall back to building on the main thread
          w.onmessage = (e: MessageEvent<FieldWorkerOut>) => {
            built.data.set(e.data.data)
            if (e.data.phase === 'near') { built.meanAcceptance = e.data.meanAcceptance; near(built) }
            else { fieldCache = { seed: CONFIG.SEED, field: built }; resolveAll(); w.terminate() }   // cache only a complete field
          }
          w.postMessage({ seed: CONFIG.SEED, nearZ: [-30, 28] } satisfies FieldWorkerIn)
        })
      }
    }

    // ---------- assets ----------
    const gltf = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
    const texLoader = new THREE.TextureLoader()
    const manifest: Record<string, SpriteMeta> = await (await fetch(assetUrl(ASSETS.sprites))).json()
    const loadTex = (file: string) => new Promise<THREE.Texture>((res, rej) => texLoader.load(assetUrl(`sprites/${file}`), (t) => {
      t.colorSpace = THREE.NoColorSpace; t.premultiplyAlpha = false; t.anisotropy = 4; res(t)
    }, undefined, rej))
    const loaded = await loadAll({
      sprites: async () => Object.fromEntries(await Promise.all(Object.entries(manifest).map(async ([k, m]) => [k, await loadTex(m.file)] as const))),
      hero: () => gltf.loadAsync(assetUrl(ASSETS.hero)),
      horse: () => gltf.loadAsync(assetUrl(ASSETS.horse)),
      heroRide: () => gltf.loadAsync(assetUrl(ASSETS.heroRide)),
    }, [], (p) => events.emit('progress', p * 0.7))   // downloads are the first 70 %, baking the rest
    if (teardown.done) return
    const sprites = loaded.sprites!
    cleanups.push(() => Object.values(sprites).forEach((t) => t.dispose()))

    // ---------- world ----------
    const rand = mulberry32(CONFIG.SEED)
    const world = scatterWorld(CONFIG.SEED)
    let field = await fieldNear
    if (teardown.done) return
    if (!field) {   // no worker (or it failed): build it all here, 70 → 85 % of the bar
      let chunk = 0; const chunks = Math.ceil(FIELD.h / 16)
      field = await buildGrassFieldAsync(world, () => { events.emit('progress', 0.7 + 0.15 * (++chunk / chunks)); return nextTick() })
      if (teardown.done) return
      fieldCache = { seed: CONFIG.SEED, field }
    }
    events.emit('progress', 0.85)
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
    fieldDone.then(() => { if (!teardown.done) grass.fieldChanged() })   // the far rows arrived
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
      return item
      cleanups.push(() => { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose() })
    }
    addScenery('hut', LAYOUT.hut, 1, [3.5, 5.25], { solid: true, tint: 0.62, wash: 0.3 }, 3.0, false)
    addScenery('firepit', LAYOUT.fire, 1, [3, 4.5], { solid: true, tint: 0.5, wash: 0.12, contrast: 3.2, mid: 0.52 }, 0, false)
    addScenery('gnarled', LAYOUT.gnarled, 1, [4, 6], { ...TREE_LOOK, sway: 0.01 }, 2.2, true)
    const STONE: Partial<GlyphOpts> = { solid: true, tint: 0.6, wash: 0.28 }
    addScenery('town_wall_side', WALL, 1, [3.5, 5.25], STONE, 0, false)
    for (const p of STONE_WALL_SEGMENTS) addScenery('stone_wall', p, 1, [3.5, 5.25], STONE, 0, false)
    for (const p of GATE_PATH) { const it = addScenery('gate_path', p, 1, [3, 4.5], { solid: true, tint: 0.5, wash: 0.2 }, 0, false); if (it) it.flat = true }
    for (const p of PEOPLE) addScenery(p.sprite, p, 1, [3, 4.5], { solid: true, tint: 0.4, wash: 0.2 }, 0.45, false)
    // the north climb: cliff walls, stony shore patches, and the mountain skyline mirrored in the lake
    const ROCK_LOOK: Partial<GlyphOpts> = { solid: true, tint: 0.48, wash: 0.24 }
    for (const c of world.cliffs) { const it = addScenery(c.sprite, c, c.scale, [3.5, 5.25], ROCK_LOOK, 1.2 * c.scale, false); if (it) it.seeThrough = true }
    for (const f of world.flats) { const it = addScenery(f.sprite, f, f.scale, [3, 4.5], { solid: true, tint: 0.45, wash: 0.2 }, 0, false); if (it) it.flat = true }
    const reflections: { src: SceneryItem; mesh: THREE.Mesh }[] = []
    for (const m of MOUNTAINS) {
      const src = addScenery(m.sprite, m, 0.7, [4, 6], { solid: true, tint: 0.55, wash: 0.3 }, 0, false)
      if (!src) continue
      const geo = new THREE.PlaneGeometry(1, 1), uv = geo.attributes.uv
      for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i))   // upside down
      const mesh = new THREE.Mesh(geo, cachedMaterial(0.008, rand() * 6.28))   // a little sway: the water moves
      const item: DrawItem = {
        mesh, world: m, isTree: false, shadow: 0, vis: false, fade: 1, flat: true, alpha: 0.3,
        // hangs down from the mountain's foot over the water, squashed like a real reflection seen from above
        rect(c) { const [gx, gy] = c.worldToScreen(m.x, 0, m.z), z = c.zoom; return { left: Math.round(gx - src.ax * z), top: Math.round(gy), w: src.pxW * z, h: src.pxH * z * 0.5 } },
      }
      compositor.add(item); reflections.push({ src, mesh })
      cleanups.push(() => { geo.dispose(); (mesh.material as THREE.Material).dispose() })
    }
    addScenery('log', LAYOUT.log, 1, [4, 6], { solid: true, tint: 0.45 }, 0.8, false)
    for (const t of world.trees) addScenery(t.sprite, t, t.scale, [4, 6], { ...TREE_LOOK, sway: t.sway }, 1.6, true)
    for (const u of world.undergrowth) addScenery(u.sprite, u, u.scale, [3, 4.5], { ...UNDER_LOOK, sway: u.sway }, 0.4, false)
    for (const r of world.rocks) addScenery(r.sprite, r, r.scale, [3, 4.5], { solid: true, tint: 0.4 }, 0.7 * r.scale, false)

    // characters
    const heroGltf = loaded.hero!, horseGltf = loaded.horse!
    const hero = prepareHero(heroGltf.scene, heroGltf.animations)
    hero.addClips(stripRootTracks(loaded.heroRide!.animations))
    const heroPivot = new THREE.Group(); heroPivot.add(hero.root)
    const heroSrc = createLiveSource(renderer, camera, atlas, heroPivot, {
      box: new THREE.Box3(new THREE.Vector3(-0.55, 0, -0.55), new THREE.Vector3(0.55, 1.85, 0.55)), margin: 1.25,
      grid: [...CONFIG.HERO_GRID] as [number, number], cell: [3, 4.5], glyph: { tint: 0.34, solid: true },
    })
    cleanups.push(() => heroSrc.dispose())
    const horse = prepareHorse(horseGltf.scene, horseGltf.animations)
    let ride = createRide(LAYOUT.horse, Math.atan2(-1, -0.35))
    const horsePos: Vec2 = { x: ride.x, z: ride.z }
    horse.root.rotation.y = ride.facing - horse.forward0
    // the horse's own collision circle follows it; riding collides with everything else
    const horseObstacle = world.obstacles.find((o) => o.x === LAYOUT.horse.x && o.z === LAYOUT.horse.z)!
    const rideObstacles = world.obstacles.filter((o) => o !== horseObstacle)
    const horsePivot = new THREE.Group(); horsePivot.add(horse.root)
    const horseSrc = createLiveSource(renderer, camera, atlas, horsePivot, {
      box: new THREE.Box3(new THREE.Vector3(-2.3, 0, -2.3), new THREE.Vector3(2.3, 2.9, 2.3)), margin: 1.1,   // room for a rider on its back and beside it while mounting
      cell: [3, 4.5], glyph: { tint: 0.36, solid: true },
    })
    cleanups.push(() => horseSrc.dispose())
    let player = createPlayer()
    let horseState = createHorse()
    let look = 0
    const playerItem: DrawItem = { mesh: heroSrc.quad, world: { x: player.x, z: player.z }, isTree: false, shadow: 0.55, vis: false, fade: 1, rect: (c) => ride.phase === 'onFoot' ? heroSrc.rect(c, playerItem.world) : { left: -1e5, top: -1e5, w: 1, h: 1 } }   // drawn by the horse while mounted
    const horseItem: DrawItem = { mesh: horseSrc.quad, world: horsePos, isTree: false, shadow: 1.4, vis: false, fade: 1, rect: (c) => horseSrc.rect(c, horsePos) }
    compositor.add(playerItem); compositor.add(horseItem)

    // ---------- saddle: measured once in three, so it holds whatever offsets the import carries ----------
    const torso2 = horse.root.getObjectByName('Torso2')!
    const heroHip = hero.root.getObjectByName('Body')!
    hero.play('Ride_Idle', 0); hero.mixer.update(0); hero.root.updateMatrixWorld(true)
    const hipLocal = hero.root.worldToLocal(heroHip.getWorldPosition(new THREE.Vector3()))   // seated hip, hero space
    hero.play('Idle', 0); horse.play('Eating', 0)
    const yAxis = new THREE.Vector3(0, 1, 0)
    const saddleOff = new THREE.Vector3(...CONFIG.SADDLE).applyAxisAngle(yAxis, horse.forward0)
    const seat = new THREE.Vector3(), ground = new THREE.Vector3(), hipRot = new THREE.Vector3(), riderEuler = new THREE.Euler()
    let mountFrom: Vec2 = { x: 0, z: 0 }, lean = 0, prevFacing = ride.facing
    let approach: { side: 'left' | 'right'; until: number } | null = null
    const wallCaption = createWallCaption(), lakeCaption = createLakeCaption()
    let snortAt = 0   // the horse answers a stroke with a snort, a beat after the touch
    /** hero.root position in horse space that puts the hip on the saddle, this frame; lean pivots about the hip */
    const seatPos = (roll: number) => {
      horse.root.updateMatrixWorld(true)
      hipRot.copy(hipLocal).applyEuler(riderEuler.set(0, horse.forward0, roll))
      return horse.root.worldToLocal(torso2.getWorldPosition(seat)).add(saddleOff).sub(hipRot)
    }
    /** a ground point (world) in horse space; the horse's pivot sits at horsePos */
    const groundPos = (p: Vec2) => horse.root.worldToLocal(ground.set(p.x - horsePos.x, 0, p.z - horsePos.z))
    const mount = () => { horse.root.add(hero.root); hero.root.rotation.set(0, horse.forward0, 0); playerItem.shadow = 0 }
    const unmount = () => { heroPivot.add(hero.root); hero.root.position.set(0, 0, 0); hero.root.rotation.set(0, player.facing, 0); playerItem.shadow = 0.55 }
    const ease = (u: number) => { const c = Math.min(1, Math.max(0, u)); return c * c * (3 - 2 * c) }
    const startMount = (t: number) => {
      ride = toggleMount(ride, player, t)
      if (ride.phase !== 'mounting') return
      mountFrom = { x: player.x, z: player.z }   // the rider already stands at the horse's side, facing along it
      mount()
      hero.play('Ride_Mount', 0.2, true)
      events.emit('caption', CONFIG.MOUNT_CAPTION)
    }

    // ---------- audio + input ----------
    const input = createInput(window, { debug: opts.debug })
    cleanups.push(() => input.dispose())
    let zoomStep: -1 | 0 | 1 = 0
    const captions = createCaptions()
    let sceneScale: number = CONFIG.SCENERY_SYMBOL_SCALE, raw = false
    input.onPress('zoomIn', () => { zoomStep = 1 })
    input.onPress('zoomOut', () => { zoomStep = -1 })
    input.onPress('mute', () => events.emit('mute', audio.toggleMute()))
    let clock = 0
    // E: stroke the horse (on foot)
    input.onPress('interact', () => {
      if (ride.phase !== 'onFoot' || approach || player.mode !== 'free' || !inStrokeRange(player, horsePos)) return
      player = faceToward(player, neckPoint(horsePos, ride.facing), clock)
      horseState = strokeHorse(horseState, clock, reactionSide(ride.facing, horsePos, player))
      snortAt = clock + CONFIG.AUDIO.snortDelay
      events.emit('caption', captions.next())
    })
    // Space: walk to the horse's nearer side, turn along it, climb on — or, riding, get down
    input.onPress('ride', () => {
      if (ride.phase === 'onFoot') {
        if (approach || player.mode !== 'free' || !inStrokeRange(player, horsePos)) return
        approach = { side: reactionSide(ride.facing, horsePos, player), until: clock + CONFIG.APPROACH.maxSecs }
      } else if (ride.phase === 'riding') {
        ride = toggleMount(ride, player, clock)
        mountFrom = sidePoint(ride, world.obstacles)   // includes the horse's own circle: lands clear of it
        hero.play('Ride_Dismount', 0.15, true)
        events.emit('caption', CONFIG.DISMOUNT_CAPTION)
      }
    })

    // ---------- layout ----------
    const layout = (clearCache = true) => {
      const w = window.innerWidth, h = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, CONFIG.MAX_DPR)
      camera.setViewport(w, h)
      renderer.setPixelRatio(dpr); renderer.setSize(w, h, false)
      paper.resize(w, h, dpr)
      compositor.setViewport(w, h)
      if (clearCache) baker.setLayout(camera.ppu, dpr, sceneScale, raw)
      for (const s of scenery) {
        const bs = bakeScale(s.scale), b = baker.bake(s.sprite, bs, s.cell, s.glyph), k = s.scale / bs
        s.pxW = b.pxW * k; s.pxH = b.pxH * k; s.ax = b.ax * k; s.ay = b.ay * k
        ;(s.mesh.material as THREE.ShaderMaterial).uniforms.map.value = b.texture
      }
      for (const r of reflections) (r.mesh.material as THREE.ShaderMaterial).uniforms.map.value = (r.src.mesh.material as THREE.ShaderMaterial).uniforms.map.value
      heroSrc.layout(camera.ppu, 1)
      horseSrc.layout(camera.ppu, CONFIG.HORSE_SYMBOL_SCALE)
      heroSrc.material.uniforms.mode.value = horseSrc.material.uniforms.mode.value = raw ? 1 : 0
    }
    const layoutAsync = async () => {
      const order = [...scenery]
      let slice = performance.now()
      // bake everything once, a few sprites per macrotask, then run the normal (now fully cached) layout
      const w = window.innerWidth, h = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, CONFIG.MAX_DPR)
      camera.setViewport(w, h)
      baker.setLayout(camera.ppu, dpr, sceneScale, raw)
      for (let i = 0; i < order.length; i++) {
        const s = order[i]
        baker.bake(s.sprite, bakeScale(s.scale), s.cell, s.glyph)
        if (performance.now() - slice > 12) {           // yield after ~12 ms of work so the loading screen keeps animating
          events.emit('progress', 0.85 + 0.15 * (i / order.length))
          await nextTick(); if (teardown.done) return
          slice = performance.now()
        }
      }
      events.emit('progress', 1)
      layout(false)
    }
    // first layout: bake scenery in small batches so the loading screen keeps animating
    await layoutAsync()
    if (teardown.done) return
    // re-baking every sprite is expensive: wait until the window stops resizing
    const relayout = trailingDebounce(layout, 150)
    const onResize = () => relayout.call()
    window.addEventListener('resize', onResize)
    cleanups.push(() => { relayout.cancel(); window.removeEventListener('resize', onResize) })
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
    let prompt: 'ride' | 'dismount' | null = null, readySent = false, nameOpacity = -1, frames = 0, probeMs = 0, lastNow = performance.now(), fpsT = 0, fpsN = 0
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
      const wasPhase = ride.phase
      ride = updateRide(ride, move, dt, t, rideObstacles)
      horsePos.x = horseObstacle.x = ride.x; horsePos.z = horseObstacle.z = ride.z
      horse.root.rotation.y = ride.facing - horse.forward0
      if (wasPhase === 'dismounting' && ride.phase === 'onFoot') {
        player = { ...player, x: mountFrom.x, z: mountFrom.z, facing: ride.facing, mode: 'free', moving: false, running: false }
        unmount()
      }
      const mounted = ride.phase !== 'onFoot'
      if (approach && (move.x !== 0 || move.z !== 0)) approach = null   // any steering cancels the walk to the horse
      if (mounted) player = { ...player, x: ride.x, z: ride.z, moving: false, running: false }
      else if (approach) {
        const target = sidePoint(ride, world.obstacles, approach.side)
        const dx = target.x - player.x, dz = target.z - player.z, d = Math.hypot(dx, dz)
        if (d > 0.12 && t < approach.until) player = updatePlayer(player, { x: dx / d, z: dz / d, run: false }, dt, t, world.obstacles)
        else {
          const turn = Math.atan2(Math.sin(ride.facing - player.facing), Math.cos(ride.facing - player.facing))
          const stepTurn = Math.max(-CONFIG.APPROACH.turnRate * dt, Math.min(CONFIG.APPROACH.turnRate * dt, turn))
          player = { ...player, facing: player.facing + stepTurn, moving: false, running: false }
          if (Math.abs(turn) < 0.05) { player = { ...player, facing: ride.facing }; approach = null; startMount(t) }
        }
      } else player = updatePlayer(player, move, dt, t, world.obstacles)
      playerItem.world.x = player.x; playerItem.world.z = player.z
      if (mounted) {
        const going = ride.phase === 'riding' && ride.speed > 0.3
        trample.stamp(ride.x, ride.z, Math.sin(ride.facing), Math.cos(ride.facing), going ? (ride.galloping ? 1.3 : 0.9) * dt * 9 : dt * 1.5, 0.6)
      } else {
        trample.stamp(player.x, player.z, Math.sin(player.facing), Math.cos(player.facing), player.moving ? (player.running ? 1.1 : 0.8) * dt * 9 : dt * 1.5, player.moving ? 0.42 : 0.32)
      }
      trample.update(dt)
      audio.step(dt, player.moving, player.running)
      audio.hoof(dt, ride.phase === 'riding' && ride.speed > 0.3, ride.galloping)
      if (snortAt && t >= snortAt) { snortAt = 0; audio.snort() }
      if (wallCaption.update(player)) events.emit('caption', CONFIG.WALL_CAPTION)
      if (lakeCaption.update(player)) events.emit('caption', CONFIG.LAKE_CAPTION)

      // horse: its own life when free, the rider's gait when ridden
      let gaitScale = 1
      if (ride.phase === 'riding') {
        const R = CONFIG.RIDE_CLIP_SPEED
        const gait = ride.speed < 0.3 ? 'Idle' : ride.galloping ? 'Gallop' : 'Walk'
        if (gait !== 'Idle') gaitScale = Math.min(1.3, Math.max(0.55, ride.speed / (gait === 'Gallop' ? R.gallop : R.walk)))
        horse.play(gait, 0.35)
        hero.play(gait === 'Idle' ? 'Ride_Idle' : gait === 'Walk' ? 'Ride_Walk' : 'Ride_Gallop', 0.3)
      } else {
        if (!mounted) horseState = updateHorse(horseState, Math.hypot(player.x - horsePos.x, player.z - horsePos.z), t, rand)
        const reacting = horseState.clip.startsWith('Idle_HitReact') && t < horseState.reactUntil
        horse.play(mounted && !reacting ? 'Idle' : horseState.clip, reacting ? 0.12 : horseState.mode === 'graze' ? 0.8 : 0.6, reacting)
        if (!mounted) hero.play(player.mode === 'stroke' ? 'Interact' : player.moving ? (player.running ? 'Run' : 'Walk') : 'Idle', player.moving ? 0.2 : 0.3)
      }
      horse.mixer.timeScale = hero.mixer.timeScale = gaitScale   // rider and horse share one gait clock
      horse.mixer.update(dt)
      hero.mixer.update(dt)
      look += ((mounted ? 0 : horseLookAngle(ride.facing, horsePos, player, horseState.mode)) - look) * Math.min(1, dt * 2.5)
      horse.applyLook(look)

      // rider: seated on the saddle; slides up from / down to the horse's side while mounting / dismounting
      const turn = Math.atan2(Math.sin(ride.facing - prevFacing), Math.cos(ride.facing - prevFacing)) / Math.max(dt, 1e-3)
      prevFacing = ride.facing
      if (mounted) {
        lean += ((ride.phase === 'riding' ? Math.max(-0.2, Math.min(0.2, -turn * 0.12)) : 0) - lean) * Math.min(1, dt * 6)
        const target = seatPos(lean)
        if (ride.phase === 'riding') hero.root.position.copy(target)
        else {
          // k: 0 standing beside the horse → 1 seated. Rise first, then swing across — never through its body.
          const secs = ride.phase === 'mounting' ? CONFIG.RIDE.mountSecs : CONFIG.RIDE.dismountSecs
          const u = Math.min(1, Math.max(0, 1 - (ride.until - t) / secs)), k = ride.phase === 'mounting' ? u : 1 - u
          const g = groundPos(mountFrom), up = ease(k / 0.65), across = ease((k - 0.3) / 0.7)
          hero.root.position.set(g.x + (target.x - g.x) * across, g.y + (target.y - g.y) * up, g.z + (target.z - g.z) * across)
        }
        hero.root.rotation.set(0, horse.forward0, lean)
      } else {
        lean = 0
        hero.root.rotation.y = player.facing
      }
      heroSrc.fireLight.position.set(LAYOUT.fire.x - player.x, 0.9, LAYOUT.fire.z - player.z)
      heroSrc.fireLight.intensity = 5 + Math.sin(t * 17) * 0.9 + Math.sin(t * 7.3) * 0.7
      horseSrc.fireLight.position.set(LAYOUT.fire.x - horsePos.x, 0.9, LAYOUT.fire.z - horsePos.z)
      horseSrc.fireLight.intensity = 3 + Math.sin(t * 15) * 0.6

      const p = ride.phase === 'riding' ? 'dismount' : ride.phase === 'onFoot' && !approach && player.mode === 'free' && inStrokeRange(player, horsePos) ? 'ride' : null
      if (p !== prompt) { prompt = p; events.emit('prompt', p) }

      // at the lake the camera leans forward and eases back to take in the water and the mountains
      const ahead = lookAhead(player)
      camera.update(dt, { x: player.x, z: player.z - ahead }, input.takeWheel(), zoomStep, ahead / 7); zoomStep = 0
      paper.draw(camera, compositor.items, [[LAYOUT.fire, 3.2, 0.09], [{ x: LAYOUT.hut.x + 0.5, z: LAYOUT.hut.z + 2.4 }, 2.6, 0.07], [LAYOUT.horse, 2.2, 0.05]], LAYOUT.fire, t, LAKE)
      heroSrc.render(); horseSrc.render()
      fire.update(dt, t, camera, LAYOUT.fire)
      grass.update(camera, t, player, horsePos)
      compositor.draw(camera, player, t, dt)

      const op = Math.min(1, Math.max(0, (camera.zoom - 1.45) / 0.2))
      if (op > 0 || Math.abs(op - nameOpacity) > 0.01) {
        nameOpacity = op
        const [nx, ny] = camera.worldToScreen(player.x, ride.phase === 'onFoot' ? 2.05 : 2.85, player.z)
        events.emit('name', { x: nx, y: ny, opacity: op })
      }
      if (!readySent) { readySent = true; events.emit('ready', true) }
      if (opts.debug) {
        fpsN++; fpsT += dt
        if (fpsT > 0.5) { events.emit('stats', `${Math.round(fpsN / fpsT)} fps · @ ${player.x.toFixed(1)},${player.z.toFixed(1)} · ${grass.count.toLocaleString()} grass (${tier.name}) · hero ${heroSrc.grid.join('×')} · zoom ${camera.zoom.toFixed(2)} · scenery ${sceneScale}× · ${gpu}`); fpsN = 0; fpsT = 0 }
      }
    }
    const loop = createLoop(step, { raf: (cb) => window.requestAnimationFrame(cb), caf: (id) => window.cancelAnimationFrame(id), doc: document })
    cleanups.push(() => loop.stop())
    loop.start()
  }

  return {
    start,
    dispose,
    on: events.on,
  }
}
