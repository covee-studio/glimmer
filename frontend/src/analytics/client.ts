import { POSTHOG_API_HOST, POSTHOG_PROJECT_KEY } from './config'
import {
  buildCaptureBody,
  currentBrowser,
  localCalendarDay,
  sanitizeEvent,
  type AnalyticsEventName,
  type SanitizedEvent,
} from './events'

export const analyticsStorageKeys = {
  consent: 'glimmer-analytics-consent',
  distinctId: 'glimmer-analytics-distinct-id',
  queue: 'glimmer-analytics-queue',
  activeDay: 'glimmer-analytics-active-day',
} as const

export const ANALYTICS_ALARM = 'glimmer-analytics-flush'

const MAX_QUEUE = 30
const BATCH_SIZE = 20
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const VERSION = /^\d{1,4}(?:\.\d{1,4}){1,3}$/

interface StorageChange {
  newValue?: unknown
}

interface ChromeLike {
  storage?: {
    local: {
      get: (keys: string[] | null, callback: (items: Record<string, unknown>) => void) => void
      set: (items: Record<string, unknown>, callback: () => void) => void
      remove: (keys: string[], callback: () => void) => void
    }
    onChanged?: {
      addListener: (listener: (changes: Record<string, StorageChange>, areaName: string) => void) => void
      removeListener: (listener: (changes: Record<string, StorageChange>, areaName: string) => void) => void
    }
  }
  runtime?: {
    lastError?: { message?: string }
    getManifest?: () => { version?: string }
  }
  alarms?: {
    create: (name: string, info: { delayInMinutes?: number; periodInMinutes?: number }) => void | Promise<void>
    clear: (name: string) => void | Promise<boolean>
  }
}

interface QueuedEvent {
  uuid: string
  event: AnalyticsEventName
  timestamp: string
  properties: Record<string, string>
}

function extensionBuild(): boolean {
  return typeof __IS_EXTENSION__ !== 'undefined' && __IS_EXTENSION__ === true
}

function chromeApi(): ChromeLike | undefined {
  return (globalThis as unknown as { chrome?: ChromeLike }).chrome
}

function extensionVersion(): string {
  try {
    const version = chromeApi()?.runtime?.getManifest?.().version
    if (typeof version === 'string' && VERSION.test(version)) return version
  } catch {
    // Manifest lookup is best-effort. The event still needs a version token.
  }
  return '0.0.0'
}

async function storageGet(keys: string[]): Promise<Record<string, unknown>> {
  const area = chromeApi()?.storage?.local
  if (!area) return {}
  return new Promise((resolve) => {
    try {
      area.get(keys, (items) => {
        if (chromeApi()?.runtime?.lastError) {
          resolve({})
          return
        }
        resolve(items ?? {})
      })
    } catch {
      resolve({})
    }
  })
}

async function storageSet(items: Record<string, unknown>): Promise<void> {
  const area = chromeApi()?.storage?.local
  if (!area) throw new Error('Analytics storage unavailable')
  await new Promise<void>((resolve, reject) => {
    try {
      area.set(items, () => {
        const error = chromeApi()?.runtime?.lastError
        if (error) reject(new Error(error.message ?? 'Analytics storage failed'))
        else resolve()
      })
    } catch (error) {
      reject(error)
    }
  })
}

/** Only local analytics metadata is removed; this does not erase user content. */
async function storageRemove(keys: string[]): Promise<void> {
  const area = chromeApi()?.storage?.local
  if (!area) throw new Error('Analytics storage unavailable')
  await new Promise<void>((resolve, reject) => {
    try {
      area.remove(keys, () => {
        const error = chromeApi()?.runtime?.lastError
        if (error) reject(new Error(error.message ?? 'Analytics storage failed'))
        else resolve()
      })
    } catch (error) {
      reject(error)
    }
  })
}

const LOCK_NAME = 'glimmer-analytics'

let chain: Promise<unknown> = Promise.resolve()
function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task)
  chain = run.then(() => undefined, () => undefined)
  return run
}

/** Extension pages and the service worker share one origin, so the Web Locks
 * API serializes queue, active-day, and distinct-id updates across all of them.
 * A realm without that API falls back to an in-module promise chain. */
function withLock<T>(task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks
  if (!locks?.request) return serialize(task)
  return locks.request(LOCK_NAME, task)
}

async function ensureAlarm() {
  try {
    await chromeApi()?.alarms?.create(ANALYTICS_ALARM, { delayInMinutes: 1, periodInMinutes: 1 })
  } catch {
    // The page also flushes on hide.
  }
}

async function clearAlarm() {
  try {
    await chromeApi()?.alarms?.clear(ANALYTICS_ALARM)
  } catch {
    // Ignore.
  }
}

function mirrorConsent(enabled: boolean) {
  try {
    localStorage.setItem(analyticsStorageKeys.consent, enabled ? 'true' : 'false')
  } catch {
    // The service worker has no localStorage. Chrome storage remains the source of truth.
  }
}

export function readConsentMirror(): boolean {
  try {
    return localStorage.getItem(analyticsStorageKeys.consent) !== 'false'
  } catch {
    return false
  }
}

export async function readConsent(): Promise<boolean> {
  if (!extensionBuild()) return false
  const area = chromeApi()?.storage?.local
  if (!area) return false
  return new Promise((resolve) => {
    try {
      area.get([analyticsStorageKeys.consent], (items) => {
        if (chromeApi()?.runtime?.lastError || !items) return resolve(false)
        const preference = items[analyticsStorageKeys.consent]
        resolve(preference === undefined || preference === true)
      })
    } catch { resolve(false) }
  })
}

function parseQueue(value: unknown): QueuedEvent[] {
  if (!Array.isArray(value)) return []
  const events: QueuedEvent[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue
    const item = entry as Record<string, unknown>
    if (typeof item.uuid !== 'string' || !UUID.test(item.uuid)) continue
    if (typeof item.event !== 'string' || typeof item.timestamp !== 'string') continue
    if (!/^\d{4}-\d{2}-\d{2}T/.test(item.timestamp)) continue
    if (!item.properties || typeof item.properties !== 'object' || Array.isArray(item.properties)) continue
    const sanitized = sanitizeEvent(item.event, item.properties as Record<string, unknown>)
    if (!sanitized) continue
    events.push({
      uuid: item.uuid,
      event: sanitized.event,
      timestamp: item.timestamp,
      properties: sanitized.properties,
    })
  }
  return events.slice(-MAX_QUEUE)
}

function captureUrl(): string | null {
  if (!POSTHOG_PROJECT_KEY || !POSTHOG_API_HOST.startsWith('https://')) return null
  try {
    const url = new URL('/batch/', POSTHOG_API_HOST)
    if (url.protocol !== 'https:' || url.username || url.password) return null
    return url.toString()
  } catch {
    return null
  }
}

const inFlight = new Set<AbortController>()

function abortSends() {
  for (const controller of inFlight) controller.abort()
  inFlight.clear()
}

function watchConsentRevocation() {
  if (!extensionBuild()) return
  const events = chromeApi()?.storage?.onChanged
  if (!events) return
  events.addListener((changes, areaName) => {
    if (areaName !== 'local' || !(analyticsStorageKeys.consent in changes)) return
    if (changes[analyticsStorageKeys.consent]?.newValue === true) return
    // Do not take the analytics lock here. This can run while the revoking
    // context still holds it, and Web Locks are not reentrant.
    abortSends()
  })
}

watchConsentRevocation()

export async function setAnalyticsConsent(enabled: boolean): Promise<void> {
  if (!extensionBuild()) return
  if (!enabled) {
    abortSends()
    await withLock(async () => {
      await storageSet({
        [analyticsStorageKeys.consent]: false,
        [analyticsStorageKeys.queue]: [],
      })
      // Revoked consent must not leave a persistent analytics identifier.
      // Clear the daily marker as well, so re-enabling starts fresh.
      await storageRemove([analyticsStorageKeys.distinctId, analyticsStorageKeys.activeDay])
      await clearAlarm()
    })
    mirrorConsent(false)
    return
  }
  await withLock(async () => {
    await storageSet({ [analyticsStorageKeys.consent]: true })
  })
  mirrorConsent(true)
}

export function subscribeConsent(listener: (enabled: boolean) => void): () => void {
  const events = chromeApi()?.storage?.onChanged
  if (!events) return () => undefined
  const handler = (changes: Record<string, StorageChange>, areaName: string) => {
    if (areaName !== 'local' || !(analyticsStorageKeys.consent in changes)) return
    listener(changes[analyticsStorageKeys.consent]?.newValue === true)
  }
  events.addListener(handler)
  return () => events.removeListener(handler)
}

async function distinctId(): Promise<string | null> {
  return withLock(async () => {
    if (!(await readConsent())) return null
    const stored = await storageGet([analyticsStorageKeys.distinctId])
    const existing = stored[analyticsStorageKeys.distinctId]
    if (typeof existing === 'string' && UUID.test(existing)) return existing
    const created = crypto.randomUUID()
    await storageSet({ [analyticsStorageKeys.distinctId]: created })
    return created
  })
}

async function enqueue(sanitized: SanitizedEvent, oncePerLocalDay = false): Promise<boolean> {
  return withLock(async () => {
    if (!(await readConsent())) return false
    const today = localCalendarDay()
    const stored = await storageGet([analyticsStorageKeys.queue, analyticsStorageKeys.activeDay])
    if (oncePerLocalDay && stored[analyticsStorageKeys.activeDay] === today) return false
    const queue = parseQueue(stored[analyticsStorageKeys.queue])
    queue.push({
      uuid: crypto.randomUUID(),
      event: sanitized.event,
      timestamp: new Date().toISOString(),
      properties: sanitized.properties,
    })
    const patch: Record<string, unknown> = { [analyticsStorageKeys.queue]: queue.slice(-MAX_QUEUE) }
    if (oncePerLocalDay) patch[analyticsStorageKeys.activeDay] = today
    await storageSet(patch)
    await ensureAlarm()
    return true
  })
}

function dropBatch(status: number): boolean {
  return status === 400 || status === 401 || status === 403 || status === 404 || status === 422
}

export async function flush(): Promise<void> {
  if (!extensionBuild()) return
  const url = captureUrl()
  if (!url) return
  const controller = new AbortController()
  inFlight.add(controller)
  try {
    if (!(await readConsent()) || controller.signal.aborted) return
    const sending = parseQueue((await storageGet([analyticsStorageKeys.queue]))[analyticsStorageKeys.queue]).slice(0, BATCH_SIZE)
    if (!sending.length) {
      await withLock(async () => {
        const current = parseQueue((await storageGet([analyticsStorageKeys.queue]))[analyticsStorageKeys.queue])
        if (!current.length) await clearAlarm()
      })
      return
    }
    const id = await distinctId()
    if (!id || !(await readConsent()) || controller.signal.aborted) return
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildCaptureBody({
        apiKey: POSTHOG_PROJECT_KEY,
        distinctId: id,
        appVersion: extensionVersion(),
        browser: currentBrowser(),
        events: sending,
      })),
      signal: controller.signal,
    })
    if (!(await readConsent()) || controller.signal.aborted) return
    if (!response.ok && !dropBatch(response.status)) return
    const sent = new Set(sending.map((event) => event.uuid))
    await withLock(async () => {
      if (!(await readConsent())) return
      const current = parseQueue((await storageGet([analyticsStorageKeys.queue]))[analyticsStorageKeys.queue])
      const remaining = current.filter((event) => !sent.has(event.uuid))
      await storageSet({ [analyticsStorageKeys.queue]: remaining })
      if (!remaining.length) await clearAlarm()
    })
  } catch {
    // Offline, aborted, or blocked. Leave the queue for a later alarm.
  } finally {
    inFlight.delete(controller)
  }
}

export async function track(event: string, properties?: Record<string, unknown>): Promise<void> {
  if (!extensionBuild()) return
  const sanitized = sanitizeEvent(event, properties)
  if (!sanitized) return
  try {
    if (!(await enqueue(sanitized))) return
    await flush()
  } catch {
    // Analytics must never surface to the reading experience.
  }
}

export async function noteActiveDay(): Promise<void> {
  if (!extensionBuild()) return
  const sanitized = sanitizeEvent('active_day')
  if (!sanitized) return
  try {
    if (!(await enqueue(sanitized, true))) return
    await flush()
  } catch {
    // Same silent failure policy as other events.
  }
}

export async function trackRuntimeInstall(details: { reason: string; previousVersion?: string }): Promise<void> {
  if (details.reason === 'install') {
    await track('extension_installed')
    return
  }
  if (details.reason === 'update') {
    await track('extension_updated', { previous_version: details.previousVersion })
  }
}

let sessionStarted = false

function entryFromLocation(): 'newtab' | 'action' {
  try {
    return new URLSearchParams(window.location.search).get('entry') === 'action' ? 'action' : 'newtab'
  } catch {
    return 'newtab'
  }
}

function stripEntryParam() {
  try {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('entry')) return
    url.searchParams.delete('entry')
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  } catch {
    // The enum was already read. Leaving the query in place does not send it.
  }
}

/** One new-tab document: entry, the daily marker, and a flush when the page hides. */
export function startExtensionSession(): void {
  if (!extensionBuild() || sessionStarted || typeof document === 'undefined') return
  sessionStarted = true
  const entry = entryFromLocation()
  stripEntryParam()
  void track('entry_opened', { entry })
  void noteActiveDay()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush()
  })
  window.addEventListener('pagehide', () => {
    void flush()
  })
}
