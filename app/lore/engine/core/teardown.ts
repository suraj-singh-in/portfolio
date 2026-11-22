/** Collects cleanups and runs them once, newest first, even if some throw. */
export type Teardown = { add(fn: () => void): void; run(): void; readonly done: boolean }

export function createTeardown(): Teardown {
  const fns: (() => void)[] = []
  let done = false
  const safe = (fn: () => void) => { try { fn() } catch { /* keep releasing the rest */ } }
  return {
    add(fn) { if (done) safe(fn); else fns.push(fn) },
    run() {
      if (done) return
      done = true
      while (fns.length) safe(fns.pop()!)
    },
    get done() { return done },
  }
}
