/* eslint-disable react-refresh/only-export-components */
// Manages which sources are enabled and their per-source config (API keys, etc.).
// Source definitions (label, color, fetch, render) live in the adapter registry —
// this context handles only enabled/disabled state + user config + localStorage.

import { createContext, useContext, useSyncExternalStore } from "react"
import type { ReactNode } from "react"
import type { SourceId } from "../types/DiscoveryItem"
import { ADAPTER_LIST } from "../sources/registry"
import { requestOptionalHostPermission } from "../utils/environment"
import { feedCache } from '../utils/feedCache'
import { invalidateSource } from '../utils/sourceLifecycle'

function urlFieldKeys(id: SourceId): string[] {
  const adapter = ADAPTER_LIST.find((a) => a.id === id)
  return adapter?.configSchema?.filter((f) => f.isUrl).map((f) => f.key) ?? []
}

// ─── Types ────────────────────────────────────────────────────
export type SourceConfigs = Partial<Record<SourceId, Record<string, string>>>

interface SourcesContextType {
  enabledSources: Set<SourceId>
  /** Returns false when a source cannot be enabled because required config is missing. */
  toggleSource: (id: SourceId, configOverride?: Record<string, string>) => boolean
  isEnabled: (id: SourceId) => boolean
  sourceConfigs: SourceConfigs
  updateSourceConfig: (id: SourceId, key: string, value: string) => void
  getSourceConfig: (id: SourceId) => Record<string, string>
  disconnectSource: (id: SourceId) => Promise<void>
  /** Requests the Chrome extension host permission needed to fetch this
   *  source's configured URL field(s), if any. Safe to call repeatedly —
   *  no-ops once granted or outside the extension context. Call this from
   *  a genuine user gesture (Save or the source toggle), since
   *  chrome.permissions.request requires one. */
  ensureHostPermission: (id: SourceId, configOverride?: Record<string, string>) => Promise<boolean>
}

const SourcesContext = createContext<SourcesContextType | undefined>(undefined)

// ─── Storage keys ─────────────────────────────────────────────
const ENABLED_KEY = "wikinote-enabled-sources"
const CONFIGS_KEY = "wikinote-source-configs"

// Sources without requiresConfig are enabled by default
const DEFAULT_SOURCE_IDS: SourceId[] = ADAPTER_LIST
  .filter((a) => !a.requiresConfig)
  .map((a) => a.id)

const ALL_SOURCE_IDS: SourceId[] = ADAPTER_LIST.map((a) => a.id)

function isFullyConfigured(id: SourceId, config: Record<string, string>): boolean {
  const adapter = ADAPTER_LIST.find((candidate) => candidate.id === id)
  if (!adapter?.requiresConfig || !adapter.configSchema) return true
  return adapter.configSchema.every((field) => field.required === false || Boolean(config[field.key]?.trim()))
}

// ─── Loaders ──────────────────────────────────────────────────
function loadEnabled(): Set<SourceId> {
  try {
    const raw = localStorage.getItem(ENABLED_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as SourceId[]
      const valid = parsed.filter((id) => ALL_SOURCE_IDS.includes(id))
      if (valid.length > 0) return new Set(valid)
    }
  } catch { /* ignore */ }
  return new Set(DEFAULT_SOURCE_IDS)
}

function loadConfigs(): SourceConfigs {
  try {
    const raw = localStorage.getItem(CONFIGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
      return Object.fromEntries(ALL_SOURCE_IDS.flatMap(id => {
        const value = parsed[id]
        if (!value || typeof value !== 'object' || Array.isArray(value)) return []
        const config = Object.fromEntries(Object.entries(value).filter(([, entry]) => typeof entry === 'string'))
        return [[id, { ...config, __cacheId: config.__cacheId || 'legacy' }]]
      })) as SourceConfigs
    }
  } catch { /* ignore */ }
  return {}
}

// Source configuration lives in shared storage, not per-tab snapshots. Mutations
// read the latest value synchronously, so a stale tab cannot restore old keys.
const CHANGE_EVENT = 'glimmer-source-settings'
let snapshotRaw = ''
let snapshot: { enabledSources: Set<SourceId>; sourceConfigs: SourceConfigs }
function getSnapshot() {
  const raw = `${localStorage.getItem(ENABLED_KEY)}|${localStorage.getItem(CONFIGS_KEY)}`
  if (!snapshot || raw !== snapshotRaw) {
    snapshotRaw = raw
    snapshot = { enabledSources: loadEnabled(), sourceConfigs: loadConfigs() }
  }
  return snapshot
}
function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === ENABLED_KEY || event.key === CONFIGS_KEY) listener()
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener(CHANGE_EVENT, listener)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(CHANGE_EVENT, listener)
  }
}
function publish(enabled: Set<SourceId>, configs: SourceConfigs) {
  localStorage.setItem(CONFIGS_KEY, JSON.stringify(configs))
  localStorage.setItem(ENABLED_KEY, JSON.stringify([...enabled]))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function SourcesProvider({ children }: { children: ReactNode }) {
  const { enabledSources, sourceConfigs } = useSyncExternalStore(subscribe, getSnapshot)

  const toggleSource = (id: SourceId, configOverride?: Record<string, string>): boolean => {
    const current = getSnapshot()
    const enabled = new Set(current.enabledSources)
    if (!enabled.has(id) && !isFullyConfigured(id, configOverride ?? current.sourceConfigs[id] ?? {})) return false
    if (enabled.has(id)) {
      if (enabled.size === 1) return false
      enabled.delete(id)
      invalidateSource(id)
    } else enabled.add(id)
    publish(enabled, current.sourceConfigs)
    return true
  }

  const isEnabled = (id: SourceId) => enabledSources.has(id)
  const updateSourceConfig = (id: SourceId, key: string, value: string) => {
    const current = getSnapshot()
    invalidateSource(id)
    publish(current.enabledSources, {
      ...current.sourceConfigs,
      [id]: { ...(current.sourceConfigs[id] ?? {}), [key]: value, __cacheId: crypto.randomUUID() },
    })
  }
  const getSourceConfig = (id: SourceId): Record<string, string> => sourceConfigs[id] ?? {}

  const disconnectSource = async (id: SourceId): Promise<void> => {
    const current = getSnapshot()
    const configs = { ...current.sourceConfigs }
    const enabled = new Set(current.enabledSources)
    invalidateSource(id)
    delete configs[id]
    enabled.delete(id)
    if (!enabled.size) enabled.add(DEFAULT_SOURCE_IDS[0])
    publish(enabled, configs)
    await feedCache.clearSource(id)
  }

  // Save requests permission for the draft endpoint before persisting it,
  // including when an already-active source changes its instance URL.
  const ensureHostPermission = async (id: SourceId, configOverride?: Record<string, string>): Promise<boolean> => {
    const adapter = ADAPTER_LIST.find((candidate) => candidate.id === id)
    if (adapter?.permissionOrigin && !await requestOptionalHostPermission(adapter.permissionOrigin)) return false
    for (const key of urlFieldKeys(id)) {
      const value = configOverride?.[key] ?? sourceConfigs[id]?.[key]
      if (value?.trim() && !await requestOptionalHostPermission(value)) return false
    }
    return true
  }

  return (
    <SourcesContext.Provider
      value={{ enabledSources, toggleSource, isEnabled, sourceConfigs, updateSourceConfig, getSourceConfig, ensureHostPermission, disconnectSource }}
    >
      {children}
    </SourcesContext.Provider>
  )
}

export function useSources() {
  const ctx = useContext(SourcesContext)
  if (!ctx) throw new Error("useSources must be used within a SourcesProvider")
  return ctx
}
