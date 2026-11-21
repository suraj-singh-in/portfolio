import { DEBUG_ACTIONS, KEYBINDINGS, type Action } from './keybindings'

export type InputTarget = Pick<EventTarget, 'addEventListener' | 'removeEventListener'>

export type Input = {
  isDown(a: Action): boolean
  /** Fires once per physical press (key repeat ignored). Returns an unsubscribe function. */
  onPress(a: Action, fn: () => void): () => void
  /** Normalised movement direction: x right, z toward the bottom of the screen. */
  moveVector(): { x: number; z: number; run: boolean }
  /** Accumulated wheel deltaY since the last call. */
  takeWheel(): number
  dispose(): void
}

type KeyEventLike = Event & { code?: string; repeat?: boolean }

export function createInput(target: InputTarget, opts: { bindings?: Record<Action, readonly string[]>; debug?: boolean } = {}): Input {
  const bindings = opts.bindings ?? KEYBINDINGS
  const debug = !!opts.debug
  const codeToActions = new Map<string, Action[]>()
  for (const [action, codes] of Object.entries(bindings) as [Action, readonly string[]][]) {
    if (!debug && DEBUG_ACTIONS.includes(action)) continue
    for (const c of codes) codeToActions.set(c, [...(codeToActions.get(c) ?? []), action])
  }
  const down = new Set<string>()
  const listeners = new Map<Action, Set<() => void>>()
  let wheel = 0

  const onKeyDown = (e: Event) => {
    const { code, repeat } = e as KeyEventLike
    if (!code) return
    down.add(code)
    if (repeat) return
    for (const a of codeToActions.get(code) ?? []) listeners.get(a)?.forEach((fn) => fn())
  }
  const onKeyUp = (e: Event) => { const { code } = e as KeyEventLike; if (code) down.delete(code) }
  const onBlur = () => down.clear()
  const onWheel = (e: Event) => { wheel += (e as Event & { deltaY?: number }).deltaY ?? 0 }

  target.addEventListener('keydown', onKeyDown)
  target.addEventListener('keyup', onKeyUp)
  target.addEventListener('blur', onBlur)
  target.addEventListener('wheel', onWheel, { passive: true } as AddEventListenerOptions)

  const isDown = (a: Action) => (bindings[a] ?? []).some((c) => down.has(c)) && (debug || !DEBUG_ACTIONS.includes(a))

  return {
    isDown,
    onPress(a, fn) {
      if (!listeners.has(a)) listeners.set(a, new Set())
      listeners.get(a)!.add(fn)
      return () => listeners.get(a)?.delete(fn)
    },
    moveVector() {
      const x = (isDown('moveRight') ? 1 : 0) - (isDown('moveLeft') ? 1 : 0)
      const z = (isDown('moveDown') ? 1 : 0) - (isDown('moveUp') ? 1 : 0)
      const len = Math.hypot(x, z)
      return len ? { x: x / len, z: z / len, run: isDown('run') } : { x: 0, z: 0, run: false }
    },
    takeWheel() { const w = wheel; wheel = 0; return w },
    dispose() {
      target.removeEventListener('keydown', onKeyDown)
      target.removeEventListener('keyup', onKeyUp)
      target.removeEventListener('blur', onBlur)
      target.removeEventListener('wheel', onWheel)
      down.clear(); listeners.clear()
    },
  }
}
