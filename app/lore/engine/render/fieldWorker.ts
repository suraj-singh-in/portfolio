/// <reference lib="webworker" />
/**
 * Builds the meadow field off the main thread: the rows around the spawn first (the loading screen
 * waits only for those), then the rest. Deterministic from the seed, so it scatters the same world.
 */
import { scatterWorld } from '../world/scatter'
import { FIELD, startGrassField } from './grassField'

export type FieldWorkerIn = { seed: number; nearZ: [number, number] }
export type FieldWorkerOut = { phase: 'near' | 'all'; data: Uint8Array<ArrayBuffer>; meanAcceptance: number }

self.onmessage = (e: MessageEvent<FieldWorkerIn>) => {
  const { seed, nearZ } = e.data
  const b = startGrassField(scatterWorld(seed))
  b.stepRows(b.rowsWithin(nearZ[0], nearZ[1]))
  const post = (phase: FieldWorkerOut['phase']) =>
    (self as unknown as Worker).postMessage({ phase, data: b.field.data.slice(), meanAcceptance: b.field.meanAcceptance } satisfies FieldWorkerOut)
  post('near')
  while (!b.done) b.stepRows(FIELD.h)
  post('all')
}
