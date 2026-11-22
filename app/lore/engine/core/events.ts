/** Tiny typed event bus: the only channel between the engine and the React UI. */
export type Events<E> = {
  on<K extends keyof E>(k: K, fn: (v: E[K]) => void): () => void
  emit<K extends keyof E>(k: K, v: E[K]): void
  clear(): void
}

export function createEvents<E>(): Events<E> {
  const subs = new Map<keyof E, Set<(v: never) => void>>()
  return {
    on(k, fn) {
      if (!subs.has(k)) subs.set(k, new Set())
      const set = subs.get(k)!
      set.add(fn as (v: never) => void)
      return () => { set.delete(fn as (v: never) => void) }
    },
    emit(k, v) { subs.get(k)?.forEach((fn) => (fn as (v: E[typeof k]) => void)(v)) },
    clear() { subs.clear() },
  }
}
