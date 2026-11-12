import { afterEach, beforeEach, expect, it, vi } from 'vitest'

let chromeLocal: Record<string, unknown>
let alarmsCreated: string[]
let alarmsCleared: string[]
let consentListeners: Array<(changes: Record<string, { newValue?: unknown }>, area: string) => void>
const fetchMock = vi.fn()

function installSharedLock() {
  let tail: Promise<unknown> = Promise.resolve()
  Object.assign(navigator, {
    locks: {
      request: (_name: string, callback: () => Promise<unknown>) => {
        const run = tail.then(callback, callback)
        tail = run.then(() => undefined, () => undefined)
        return run
      },
    },
  })
}

beforeEach(() => {
  vi.resetModules()
  chromeLocal = {}
  alarmsCreated = []
  alarmsCleared = []
  consentListeners = []
  fetchMock.mockReset()
  fetchMock.mockResolvedValue(new Response(null, { status: 200 }))
  vi.stubGlobal('__IS_EXTENSION__', true)
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('chrome', {
    runtime: {
      getManifest: () => ({ version: '2.3.1' }),
    },
    storage: {
      local: {
        get: (keys: string[] | null, callback: (items: Record<string, unknown>) => void) => {
          if (keys === null) {
            callback({ ...chromeLocal })
            return
          }
          const result: Record<string, unknown> = {}
          for (const key of keys) {
            if (key in chromeLocal) result[key] = chromeLocal[key]
          }
          callback(result)
        },
        set: (items: Record<string, unknown>, callback: () => void) => {
          const changes: Record<string, { newValue?: unknown }> = {}
          for (const [key, value] of Object.entries(items)) changes[key] = { newValue: value }
          Object.assign(chromeLocal, items)
          callback()
          for (const listener of [...consentListeners]) listener(changes, 'local')
        },
      },
      onChanged: {
        addListener: (listener: (changes: Record<string, { newValue?: unknown }>, area: string) => void) => {
          consentListeners.push(listener)
        },
        removeListener: (listener: (changes: Record<string, { newValue?: unknown }>, area: string) => void) => {
          consentListeners = consentListeners.filter((candidate) => candidate !== listener)
        },
      },
    },
    alarms: {
      create: (name: string) => { alarmsCreated.push(name) },
      clear: (name: string) => { alarmsCleared.push(name) },
    },
  })
  vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 Chrome/120.0.0.0' })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

async function load() {
  return import('../src/analytics/client')
}

it('sends nothing and keeps no queue while consent is off', async () => {
  const { track, flush, analyticsStorageKeys, setAnalyticsConsent } = await load()
  await setAnalyticsConsent(false)
  await track('entry_opened', { entry: 'newtab' })
  await track('content_shown', { source: 'wikipedia' })
  await flush()
  expect(fetchMock).not.toHaveBeenCalled()
  expect(chromeLocal[analyticsStorageKeys.queue]).toEqual([])
  expect(chromeLocal[analyticsStorageKeys.distinctId]).toBeUndefined()
  expect(alarmsCreated).toEqual([])
})

it('sends allowlisted events with super properties and no content fields', async () => {
  const { setAnalyticsConsent, track, analyticsStorageKeys } = await load()
  await setAnalyticsConsent(true)
  await track('content_shown', { source: 'hackernews' })
  await track('entry_opened', { entry: 'action', app: 'not-glimmer' })
  expect(fetchMock).toHaveBeenCalled()
  expect(fetchMock.mock.calls[0]?.[0]).toBe('https://us.i.posthog.com/batch/')
  expect((fetchMock.mock.calls[0]?.[1] as RequestInit).credentials).toBe('omit')
  const bodies = fetchMock.mock.calls.map((call) => JSON.parse(String((call[1] as RequestInit).body)) as {
    batch: Array<{ event: string; distinct_id: string; properties: Record<string, unknown> }>
  })
  const events = bodies.flatMap((body) => body.batch)
  expect(events.map((event) => event.event)).toEqual(['content_shown', 'entry_opened'])
  for (const event of events) {
    expect(event.properties.app).toBe('glimmer')
    expect(event.properties.app_version).toBe('2.3.1')
    expect(event.properties.browser).toBe('chrome')
    expect(event.properties.$ip).toBeNull()
    expect(event.distinct_id).toMatch(/^[0-9a-f-]{36}$/i)
  }
  expect(events[0]?.properties.source).toBe('hackernews')
  expect(events[1]?.properties.entry).toBe('action')
  expect(events[1]?.properties.app).toBe('glimmer')
  const serialized = JSON.stringify(events)
  expect(serialized).not.toMatch(/https?:\/\/|www\.|\.org|title|token|wikipedia\.org/i)
  expect(chromeLocal[analyticsStorageKeys.queue]).toEqual([])
  expect(chromeLocal[analyticsStorageKeys.distinctId]).toEqual(events[0]?.distinct_id)
})

it('drops events that include a url, title, or unknown event', async () => {
  const { setAnalyticsConsent, track, analyticsStorageKeys } = await load()
  await setAnalyticsConsent(true)
  await track('content_shown', { source: 'https://en.wikipedia.org/wiki/Ada', title: 'Ada Lovelace' })
  await track('page_viewed', { url: 'https://example.com' })
  await track('extension_updated', { previous_version: 'https://evil.example/x' })
  expect(fetchMock).not.toHaveBeenCalled()
  expect(chromeLocal[analyticsStorageKeys.queue] ?? []).toEqual([])
  expect(chromeLocal[analyticsStorageKeys.distinctId]).toBeUndefined()
})

it('records active_day at most once per local day', async () => {
  const { setAnalyticsConsent, noteActiveDay } = await load()
  await setAnalyticsConsent(true)
  await noteActiveDay()
  await noteActiveDay()
  const events = fetchMock.mock.calls.flatMap((call) => {
    const body = JSON.parse(String((call[1] as RequestInit).body)) as { batch: Array<{ event: string }> }
    return body.batch.map((event) => event.event)
  })
  expect(events).toEqual(['active_day'])
})

it('drops the queue on opt-out and does not send a later event', async () => {
  const { setAnalyticsConsent, track, analyticsStorageKeys } = await load()
  fetchMock.mockImplementation((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => {
    const signal = init?.signal
    if (!signal) return
    if (signal.aborted) {
      reject(new DOMException('The operation was aborted.', 'AbortError'))
      return
    }
    signal.addEventListener('abort', () => {
      reject(new DOMException('The operation was aborted.', 'AbortError'))
    })
  }))
  await setAnalyticsConsent(true)
  const pending = track('entry_opened', { entry: 'newtab' })
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
  await setAnalyticsConsent(false)
  await pending
  fetchMock.mockClear()
  await track('content_shown', { source: 'weread' })
  expect(fetchMock).not.toHaveBeenCalled()
  expect(chromeLocal[analyticsStorageKeys.queue]).toEqual([])
  expect(chromeLocal[analyticsStorageKeys.consent]).toBe(false)
  expect(alarmsCleared.length).toBeGreaterThan(0)
})

it('sends install and update only when consent is already on', async () => {
  const { setAnalyticsConsent, trackRuntimeInstall } = await load()
  await setAnalyticsConsent(false)
  await trackRuntimeInstall({ reason: 'install' })
  expect(fetchMock).not.toHaveBeenCalled()
  await setAnalyticsConsent(true)
  await trackRuntimeInstall({ reason: 'update', previousVersion: '2.3.0' })
  await trackRuntimeInstall({ reason: 'chrome_update', previousVersion: '2.3.0' })
  const events = fetchMock.mock.calls.flatMap((call) => {
    const body = JSON.parse(String((call[1] as RequestInit).body)) as {
      batch: Array<{ event: string; properties: Record<string, unknown> }>
    }
    return body.batch
  })
  expect(events).toEqual([
    expect.objectContaining({
      event: 'extension_updated',
      properties: expect.objectContaining({ previous_version: '2.3.0', app: 'glimmer' }),
    }),
  ])
})

async function twoClients() {
  installSharedLock()
  const first = await load()
  vi.resetModules()
  const second = await load()
  return [first, second] as const
}

function sentEvents() {
  return fetchMock.mock.calls.flatMap((call) => {
    const body = JSON.parse(String((call[1] as RequestInit).body)) as {
      batch: Array<{ event: string; distinct_id: string }>
    }
    return body.batch
  })
}

it('keeps events from two extension contexts instead of letting one write win', async () => {
  const [{ setAnalyticsConsent, track, analyticsStorageKeys }, other] = await twoClients()
  await setAnalyticsConsent(true)
  await Promise.all([
    track('entry_opened', { entry: 'newtab' }),
    other.track('content_shown', { source: 'wikipedia' }),
  ])
  const names = [
    ...sentEvents().map((event) => event.event),
    ...((chromeLocal[analyticsStorageKeys.queue] as Array<{ event: string }> | undefined) ?? []).map((event) => event.event),
  ]
  expect(names).toEqual(expect.arrayContaining(['entry_opened', 'content_shown']))
  const ids = sentEvents().map((event) => event.distinct_id)
  expect(new Set(ids).size).toBe(1)
  expect(ids[0]).toBe(chromeLocal[analyticsStorageKeys.distinctId])
})

it('records one active day and one install id when two contexts start together', async () => {
  const [{ setAnalyticsConsent, noteActiveDay, flush, analyticsStorageKeys }, other] = await twoClients()
  await setAnalyticsConsent(true)
  await Promise.all([noteActiveDay(), other.noteActiveDay()])
  const queued = (chromeLocal[analyticsStorageKeys.queue] as Array<{ event: string }> | undefined) ?? []
  const activeDays = [...sentEvents(), ...queued].filter((event) => event.event === 'active_day')
  expect(activeDays).toHaveLength(1)

  const firstId = crypto.randomUUID()
  const secondId = crypto.randomUUID()
  chromeLocal[analyticsStorageKeys.distinctId] = undefined
  delete chromeLocal[analyticsStorageKeys.distinctId]
  chromeLocal[analyticsStorageKeys.queue] = [
    { uuid: firstId, event: 'entry_opened', timestamp: new Date().toISOString(), properties: { entry: 'newtab' } },
    { uuid: secondId, event: 'content_shown', timestamp: new Date().toISOString(), properties: { source: 'memos' } },
  ]
  fetchMock.mockClear()
  await Promise.all([flush(), other.flush()])
  const ids = sentEvents().map((event) => event.distinct_id)
  expect(ids.length).toBeGreaterThan(0)
  expect(new Set(ids).size).toBe(1)
  expect(chromeLocal[analyticsStorageKeys.distinctId]).toBe(ids[0])
})

it('aborts an in-flight send in another context when consent is turned off', async () => {
  const [{ setAnalyticsConsent, track, analyticsStorageKeys }, other] = await twoClients()
  fetchMock.mockImplementation((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => {
    const signal = init?.signal
    if (!signal) return
    if (signal.aborted) {
      reject(new DOMException('The operation was aborted.', 'AbortError'))
      return
    }
    signal.addEventListener('abort', () => {
      reject(new DOMException('The operation was aborted.', 'AbortError'))
    })
  }))
  await setAnalyticsConsent(true)
  const pending = track('entry_opened', { entry: 'action' })
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
  const signal = (fetchMock.mock.calls[0]?.[1] as RequestInit).signal as AbortSignal
  await other.setAnalyticsConsent(false)
  expect(signal.aborted).toBe(true)
  await pending
  fetchMock.mockClear()
  await other.track('content_shown', { source: 'hypothesis' })
  await track('active_day')
  expect(fetchMock).not.toHaveBeenCalled()
  expect(chromeLocal[analyticsStorageKeys.queue]).toEqual([])
  expect(chromeLocal[analyticsStorageKeys.consent]).toBe(false)
})

it('keeps a failed batch queued and retries on the next flush', async () => {
  const { setAnalyticsConsent, track, flush, analyticsStorageKeys } = await load()
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }))
  await setAnalyticsConsent(true)
  await track('settings_changed', { setting: 'theme', theme_id: 'campfire' })
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const queued = chromeLocal[analyticsStorageKeys.queue] as Array<{ event: string; properties: Record<string, string> }>
  expect(queued).toHaveLength(1)
  expect(queued[0]?.properties).toEqual({ setting: 'theme', theme_id: 'campfire' })
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }))
  await flush()
  expect(chromeLocal[analyticsStorageKeys.queue]).toEqual([])
})

it('rejects unrecognized theme identifiers', async () => {
  const { setAnalyticsConsent, track } = await load()
  await setAnalyticsConsent(true)
  await track('settings_changed', { setting: 'theme', theme_id: 'private-note' })
  expect(fetchMock).not.toHaveBeenCalled()
})

it('enables statistics by default and preserves explicit opt-out', async () => {
  const { track, setAnalyticsConsent, readConsent } = await load()
  expect(await readConsent()).toBe(true)
  await track('entry_opened', { entry: 'newtab' })
  expect(fetchMock).toHaveBeenCalled()
  await setAnalyticsConsent(false)
  fetchMock.mockClear()
  expect(await readConsent()).toBe(false)
  await track('entry_opened', { entry: 'newtab' })
  expect(fetchMock).not.toHaveBeenCalled()
})
