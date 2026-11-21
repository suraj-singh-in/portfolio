/** True if the browser can create a WebGL2 context (the engine needs it). */
export function detectWebGL(make: () => { getContext(id: string): unknown }): boolean {
  try {
    return !!make().getContext('webgl2')
  } catch {
    return false
  }
}
