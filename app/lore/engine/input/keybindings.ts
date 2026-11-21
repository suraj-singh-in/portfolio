/**
 * Action -> physical keys (KeyboardEvent.code, so layouts like AZERTY still work).
 * Single source of truth for controls. Debug actions only fire with ?debug in the URL.
 */
export const KEYBINDINGS = {
  moveUp: ['KeyW', 'ArrowUp'],
  moveDown: ['KeyS', 'ArrowDown'],
  moveLeft: ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  run: ['ShiftLeft', 'ShiftRight'],
  interact: ['KeyE'],
  mute: ['KeyM'],
  zoomIn: ['Equal', 'NumpadAdd'],
  zoomOut: ['Minus', 'NumpadSubtract'],
  debugRaw: ['KeyT'],
  debugSceneryDown: ['BracketLeft'],
  debugSceneryUp: ['BracketRight'],
} as const satisfies Record<string, readonly string[]>

export type Action = keyof typeof KEYBINDINGS

export const DEBUG_ACTIONS: readonly Action[] = ['debugRaw', 'debugSceneryDown', 'debugSceneryUp']
