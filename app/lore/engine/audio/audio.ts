import { CONFIG } from '../config'

/** The subset of HTMLAudioElement the controller uses (injectable for tests). */
export type AudioLike = {
  play(): Promise<void>
  pause(): void
  loop: boolean
  volume: number
  muted: boolean
  currentTime: number
  playbackRate: number
}

export type AudioController = {
  /** Call on any user gesture; browsers block audio until then. Safe to call repeatedly. */
  unlock(): void
  toggleMute(): boolean
  isMuted(): boolean
  /** Advance footstep timing; plays a step at the walk/run interval while moving. */
  step(dt: number, moving: boolean, running: boolean): void
  dispose(): void
}

const MUTE_KEY = 'lore:muted'

export function createAudio(opts: {
  ambienceUrl: string
  stepUrl: string
  make: (url: string) => AudioLike
  storage: Pick<Storage, 'getItem' | 'setItem'>
  /** 'blocked' when the browser refuses autoplay (needs a click/key), 'on' once ambience plays */
  onState?: (s: 'on' | 'blocked') => void
}): AudioController {
  const A = CONFIG.AUDIO
  const ambience = opts.make(opts.ambienceUrl)
  ambience.loop = true
  ambience.volume = A.ambience
  const steps = Array.from({ length: A.stepPool }, () => { const s = opts.make(opts.stepUrl); s.volume = A.step; return s })
  let muted = false
  try { muted = opts.storage.getItem(MUTE_KEY) === '1' } catch { /* storage unavailable */ }
  let unlocked = false, pending = false, stepIdx = 0, timer = 0.1

  const applyMute = () => { ambience.muted = muted; steps.forEach((s) => (s.muted = muted)) }
  applyMute()

  return {
    unlock() {
      if (unlocked || pending) return
      pending = true
      ambience.play()
        .then(() => { unlocked = true; opts.onState?.('on') })
        .catch(() => { opts.onState?.('blocked') })   // retry on the next gesture
        .finally(() => { pending = false })
    },
    toggleMute() {
      muted = !muted
      applyMute()
      try { opts.storage.setItem(MUTE_KEY, muted ? '1' : '0') } catch { /* storage unavailable */ }
      return muted
    },
    isMuted: () => muted,
    step(dt, moving, running) {
      if (!moving || !unlocked) { timer = 0.1; return }
      timer -= dt
      if (timer > 1e-9) return
      timer = running ? A.runInterval : A.walkInterval
      const s = steps[stepIdx++ % steps.length]
      s.currentTime = 0
      s.playbackRate = 0.9 + Math.random() * 0.2
      s.play().catch(() => {})
    },
    dispose() { ambience.pause(); steps.forEach((s) => s.pause()) },
  }
}
