// Shared source generations invalidate in-flight requests even before React
// receives another tab's storage event. Locks order cache writes and cleanup.
import { StorageAdapter } from './environment'

const PREFIX = 'wikinote-source-generation-'
const EVENT = 'glimmer-source-generation'
const controllers = new Map<string, { generation: string; controller: AbortController }>()

export function sourceGeneration(id: string): string {
  return localStorage.getItem(PREFIX + id) ?? ''
}

export function assertSourceConfigured(id: string, revision?: string): void {
  if (!revision) return
  const configs = JSON.parse(localStorage.getItem('wikinote-source-configs') ?? '{}')
  if (!configs[id] || (configs[id].__cacheId ?? 'legacy') !== revision) {
    throw new DOMException('Source configuration was removed or replaced', 'AbortError')
  }
}

export function invalidateSource(id: string): void {
  localStorage.setItem(PREFIX + id, crypto.randomUUID())
  controllers.get(id)?.controller.abort()
  window.dispatchEvent(new Event(EVENT))
}

export function sourceSignal(id: string): AbortSignal {
  const generation = sourceGeneration(id)
  let entry = controllers.get(id)
  if (!entry || entry.generation !== generation) {
    entry?.controller.abort()
    entry = { generation, controller: new AbortController() }
    controllers.set(id, entry)
  }
  return entry.controller.signal
}

export function assertSourceCurrent(id: string, generation: string): void {
  if (sourceGeneration(id) !== generation) throw new DOMException('Source settings changed', 'AbortError')
}

export async function withSourceLock<T>(id: string, operation: () => Promise<T>): Promise<T> {
  return typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request(`glimmer-source-${id}`, operation)
    : operation()
}

export async function commitSourceCache(id: string, generation: string, operation: () => Promise<void>): Promise<void> {
  await withSourceLock(id, async () => {
    assertSourceCurrent(id, generation)
    await operation()
  })
}

// Local settings changes and native storage events share cancellation behavior.
if (typeof window !== 'undefined') {
  const refresh = () => {
    for (const [id, entry] of controllers) {
      if (sourceGeneration(id) !== entry.generation) entry.controller.abort()
    }
  }
  window.addEventListener('storage', refresh)
  window.addEventListener(EVENT, refresh)
}

export async function clearSourceCaches(id: string): Promise<void> {
  await withSourceLock(id, async () => {
    const prefixes = [`wikinote-feed-v1-${id}-`, `wikinote-feed-v2-${id}-`, `wikinote-${id}-cursor-`]
    if (id === 'weread') prefixes.push('wikinote-weread-v1-')
    const keys = await StorageAdapter.localKeys()
    await Promise.all(keys.filter(key => prefixes.some(prefix => key.startsWith(prefix))).map(key => StorageAdapter.remove(key)))
  })
}
