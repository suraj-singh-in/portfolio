/** /lore is desktop-only: no touch-first devices, no windows narrower than 900 px. */
export const DESKTOP_MIN_WIDTH = 900

export function isDesktop(env: { width: number; coarsePointer: boolean }): boolean {
  return !env.coarsePointer && env.width >= DESKTOP_MIN_WIDTH
}
