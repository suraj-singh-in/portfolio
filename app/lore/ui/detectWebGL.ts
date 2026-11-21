type ProbeContext = { getExtension?(name: string): { loseContext(): void } | null }

/** True if the browser can create a WebGL2 context. The probe context is released immediately. */
export function detectWebGL(make: () => { getContext(id: string): unknown }): boolean {
  try {
    const ctx = make().getContext('webgl2') as ProbeContext | null
    if (!ctx) return false
    try { ctx.getExtension?.('WEBGL_lose_context')?.loseContext() } catch { /* best effort */ }
    return true
  } catch {
    return false
  }
}
