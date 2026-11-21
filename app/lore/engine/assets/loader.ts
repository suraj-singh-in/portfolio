type Jobs = Record<string, () => Promise<unknown>>
export type Loaded<T extends Jobs> = { [K in keyof T]: Awaited<ReturnType<T[K]>> | null }

/**
 * Run all load jobs in parallel. Progress counts finished jobs (0 → 1, never decreasing).
 * A failing optional job resolves to null (e.g. audio); a failing required job rejects.
 */
export async function loadAll<T extends Jobs>(jobs: T, optional: (keyof T)[], onProgress: (p: number) => void): Promise<Loaded<T>> {
  const keys = Object.keys(jobs) as (keyof T)[]
  let done = 0
  onProgress(0)
  const results = await Promise.all(keys.map(async (k) => {
    try {
      return await jobs[k]()
    } catch (e) {
      if (optional.includes(k)) return null
      throw e
    } finally {
      done++
      onProgress(done / keys.length)
    }
  }))
  return Object.fromEntries(keys.map((k, i) => [k, results[i]])) as Loaded<T>
}
