type Scheduler = { set(fn: () => void, ms: number): number; clear(id: number): void }

const timeouts: Scheduler = { set: (fn, ms) => window.setTimeout(fn, ms), clear: (id) => window.clearTimeout(id) }

/** Run `fn` once, `ms` after the last call in a burst (e.g. while a window edge is being dragged). */
export function trailingDebounce(fn: () => void, ms: number, sched: Scheduler = timeouts) {
  let id: number | null = null
  return {
    call() { if (id !== null) sched.clear(id); id = sched.set(() => { id = null; fn() }, ms) },
    cancel() { if (id !== null) sched.clear(id); id = null },
  }
}
