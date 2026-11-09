export const ANALYTICS_APP = 'glimmer'

export const SOURCE_IDS = ['wikipedia', 'hackernews', 'memos', 'hypothesis', 'weread'] as const
export type AnalyticsSource = (typeof SOURCE_IDS)[number]

export const ENTRY_IDS = ['newtab', 'action'] as const
export type AnalyticsEntry = (typeof ENTRY_IDS)[number]

export const SETTING_KEYS = [
  'source_enabled',
  'source_disabled',
  'language',
  'theme',
  'sync_favorites',
  'analytics_consent',
] as const
export type AnalyticsSetting = (typeof SETTING_KEYS)[number]

export const EVENT_NAMES = [
  'extension_installed',
  'extension_updated',
  'entry_opened',
  'content_shown',
  'active_day',
  'settings_changed',
] as const
export type AnalyticsEventName = (typeof EVENT_NAMES)[number]

export const BROWSER_NAMES = ['chrome', 'edge', 'opera', 'brave', 'chromium', 'other'] as const
export type BrowserName = (typeof BROWSER_NAMES)[number]

const VERSION = /^\d{1,4}(?:\.\d{1,4}){1,3}$/

export interface SanitizedEvent {
  event: AnalyticsEventName
  properties: Record<string, string>
}

export function localCalendarDay(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isEnum<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
}

function looksSensitive(value: string): boolean {
  if (value.length === 0 || value.length > 32) return true
  if (/[\s/?#@\\]|:\/\//.test(value)) return true
  if (/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(value) && !VERSION.test(value)) return true
  return false
}

/**
 * Allowlists event names and properties. Any URL-like or unexpected value
 * drops the whole event so a caller cannot attach reading content.
 */
export function sanitizeEvent(event: string, properties?: Record<string, unknown>): SanitizedEvent | null {
  if (!isEnum(event, EVENT_NAMES)) return null
  const input = properties ?? {}
  const entries = Object.entries(input)
  if (entries.length > 4) return null
  for (const [, value] of entries) {
    if (value == null) continue
    if (typeof value !== 'string' || looksSensitive(value)) return null
  }

  switch (event) {
    case 'extension_installed':
    case 'active_day':
      return { event, properties: {} }
    case 'extension_updated': {
      const previous = input.previous_version
      if (previous == null) return { event, properties: {} }
      if (typeof previous !== 'string' || !VERSION.test(previous)) return null
      return { event, properties: { previous_version: previous } }
    }
    case 'entry_opened':
      if (!isEnum(input.entry, ENTRY_IDS)) return null
      return { event, properties: { entry: input.entry } }
    case 'content_shown':
      if (!isEnum(input.source, SOURCE_IDS)) return null
      return { event, properties: { source: input.source } }
    case 'settings_changed': {
      if (!isEnum(input.setting, SETTING_KEYS)) return null
      const props: Record<string, string> = { setting: input.setting }
      if (input.setting === 'source_enabled' || input.setting === 'source_disabled') {
        if (!isEnum(input.source_id, SOURCE_IDS)) return null
        props.source_id = input.source_id
      }
      return { event, properties: props }
    }
    default:
      return null
  }
}

export function detectBrowser(userAgent: string, hasBrave = false): BrowserName {
  if (hasBrave) return 'brave'
  if (/Edg\//.test(userAgent)) return 'edge'
  if (/OPR\//.test(userAgent)) return 'opera'
  if (/Chromium\//.test(userAgent) && !/Chrome\//.test(userAgent)) return 'chromium'
  if (/Chrome\//.test(userAgent)) return 'chrome'
  if (/Chromium\//.test(userAgent)) return 'chromium'
  return 'other'
}

export function currentBrowser(): BrowserName {
  const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent
  const hasBrave = typeof navigator !== 'undefined' && 'brave' in navigator
  return detectBrowser(userAgent, hasBrave)
}

export interface CaptureBatchEvent {
  uuid: string
  event: AnalyticsEventName
  timestamp: string
  properties: Record<string, string>
}

export function buildCaptureBody(args: {
  apiKey: string
  distinctId: string
  appVersion: string
  browser: BrowserName
  events: CaptureBatchEvent[]
}) {
  return {
    api_key: args.apiKey,
    batch: args.events.map((event) => ({
      uuid: event.uuid,
      event: event.event,
      distinct_id: args.distinctId,
      timestamp: event.timestamp,
      properties: {
        ...event.properties,
        app: ANALYTICS_APP,
        app_version: args.appVersion,
        browser: args.browser,
        $lib: 'glimmer-http',
        // Ask PostHog not to retain the request IP. Null is a PostHog sentinel, not content.
        $ip: null as null,
      },
    })),
  }
}
