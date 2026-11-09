import { afterEach, beforeEach, expect, it, vi } from 'vitest'

let chromeLocal: Record<string, unknown>
let alarmsCreated: string[]
let alarmsCleared: string[]
const fetchMock = vi.fn()

beforeEach(() => {
  vi.resetModules()
  chromeLocal = {}
  alarmsCreated = []
  alarmsCleared = []
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
          Object.assign(chromeLocal, items)
          callback()
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
  const { track, flush, analyticsStorageKeys } = await load()
  await track('entry_opened', { entry: 'newtab' })
  await track('content_shown', { source: 'wikipedia' })
  await flush()
  expect(fetchMock).not.toHaveBeenCalled()
  expect(chromeLocal[analyticsStorageKeys.queue]).toBeUndefined()
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

it('keeps a failed batch queued and retries on the next flush', async () => {
  const { setAnalyticsConsent, track, flush, analyticsStorageKeys } = await load()
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }))
  await setAnalyticsConsent(true)
  await track('settings_changed', { setting: 'theme', value: 'campfire' })
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const queued = chromeLocal[analyticsStorageKeys.queue] as Array<{ event: string; properties: Record<string, string> }>
  expect(queued).toHaveLength(1)
  expect(queued[0]?.properties).toEqual({ setting: 'theme' })
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }))
  await flush()
  expect(chromeLocal[analyticsStorageKeys.queue]).toEqual([])
})
