export type LoopEnv = {
  raf: (cb: FrameRequestCallback) => number
  caf: (id: number) => void
  doc: Pick<Document, 'hidden' | 'addEventListener' | 'removeEventListener'>
}

export type Loop = { start(): void; stop(): void; readonly running: boolean }

const MAX_DT = 0.05

/** One requestAnimationFrame loop; dt clamped, paused while the tab is hidden, no jump on resume. */
export function createLoop(step: (dt: number, t: number) => void, env: LoopEnv): Loop {
  let id: number | null = null
  let last: number | null = null
  let t = 0
  let running = false

  const frame: FrameRequestCallback = (now) => {
    id = null
    const dt = last === null ? 0 : Math.min(MAX_DT, (now - last) / 1000)
    last = now
    t += dt
    step(dt, t)
    if (running && !env.doc.hidden) id = env.raf(frame)
  }
  const onVisibility = () => {
    if (!running) return
    if (env.doc.hidden) { if (id !== null) env.caf(id); id = null }
    else if (id === null) { last = null; id = env.raf(frame) }
  }

  return {
    start() {
      if (running) return
      running = true; last = null
      env.doc.addEventListener('visibilitychange', onVisibility)
      if (!env.doc.hidden) id = env.raf(frame)
    },
    stop() {
      running = false
      if (id !== null) env.caf(id)
      id = null
      env.doc.removeEventListener('visibilitychange', onVisibility)
    },
    get running() { return running },
  }
}
