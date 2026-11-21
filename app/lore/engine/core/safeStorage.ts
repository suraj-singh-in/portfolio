type Store = Pick<Storage, 'getItem' | 'setItem'>

/**
 * localStorage that never throws: falls back to memory when site data is blocked
 * (accessing window.localStorage or calling it can throw SecurityError).
 */
export function safeStorage(get: () => Storage): Store {
  const mem = new Map<string, string>()
  let real: Store | null = null
  try { real = get() } catch { real = null }
  return {
    getItem(k) {
      if (mem.has(k)) return mem.get(k)!
      try { return real ? real.getItem(k) : null } catch { real = null; return null }
    },
    setItem(k, v) {
      mem.set(k, v)
      try { real?.setItem(k, v) } catch { real = null }
    },
  }
}
