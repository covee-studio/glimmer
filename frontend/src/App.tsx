import { useQueries } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ZenMode } from "./components/ZenMode"
import { useSources } from "./contexts/SourcesContext"
import { useToast } from "./contexts/ToastContext"
import { useLocalization } from "./hooks/useLocalization"
import { ADAPTER_LIST } from "./sources/registry"
import type { SourceAdapter } from "./sources/adapter"
import type { DiscoveryItem } from "./types/DiscoveryItem"
import type { SourceId } from "./types/DiscoveryItem"
import { startExtensionSession } from "./analytics/client"
import { feedCache, CACHE_TTL_MS } from "./utils/feedCache"
import { getRecentSeenIds } from "./utils/localCollection"

type ItemsBySource = Partial<Record<SourceId, DiscoveryItem[]>>

import { assertSourceConfigured, assertSourceCurrent, commitSourceCache, sourceGeneration, sourceSignal } from "./utils/sourceLifecycle"

function interleaveN(arrays: DiscoveryItem[][]): DiscoveryItem[] {
  const result: DiscoveryItem[] = []
  const queues = arrays.map((a) => (Array.isArray(a) ? [...a] : []))
  while (queues.some((q) => q.length > 0)) {
    for (const q of queues) {
      if (q.length > 0) result.push(q.shift()!)
    }
  }
  return result
}

function dedup(items: DiscoveryItem[]): DiscoveryItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function configFingerprint(adapter: SourceAdapter, config: Record<string, string>): string {
  const fields = adapter.configSchema ?? []
  const normalized = fields.reduce<Record<string, string>>((acc, field) => {
    const value = config[field.key]?.trim() ?? ""
    acc[field.key] = field.secret ? `revision:${config.__cacheId ?? 'unconfigured'}` : value
    return acc
  }, {})
  return JSON.stringify(normalized)
}

/** Returns true only when every required config field has a non-empty value. */
function isFullyConfigured(adapter: SourceAdapter, config: Record<string, string>): boolean {
  if (!adapter.requiresConfig || !adapter.configSchema) return true
  return adapter.configSchema.every((f) => f.required === false || Boolean(config[f.key]?.trim()))
}

function App() {
  const [extraItemsBySource, setExtraItemsBySource] = useState<ItemsBySource>({})
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreController = useRef<AbortController | null>(null)
  const autoTopUpsRef = useRef(0)
  const extraItemsFeedKey = useRef('')
  const [zenIndex, setZenIndex] = useState(-1)
  // Incremented each time a replaceAnchorOnRefetch source gets fresh data.
  // Passed to ZenMode so it can reset the anchor independently of feedKey.
  const [anchorKey, setAnchorKey] = useState(0)

  const { currentLanguage, ready } = useLocalization()
  const { enabledSources, getSourceConfig } = useSources()
  const { showToast } = useToast()

  useEffect(() => {
    startExtensionSession()
  }, [])

  const zenRestorePendingRef = useRef(true)
  // Tracks the last-seen dataUpdatedAt per adapter so we can detect genuine
  // refetches (dataUpdatedAt changed from a previously recorded non-zero value).
  const prevDataUpdatedAtRef = useRef<Partial<Record<SourceId, number>>>({})

  const activeAdapters = ADAPTER_LIST.filter((a) => enabledSources.has(a.id))
  // Source forms keep a local draft and commit on Save, so no second debounce is needed.
  const settledConfigs = Object.fromEntries(activeAdapters.map(adapter => [adapter.id, getSourceConfig(adapter.id)]))
  const activeSourceKey = activeAdapters
    .map((adapter) => {
      const langId = adapter.id === "wikipedia" ? currentLanguage.id : ""
      const config = settledConfigs[adapter.id] ?? {}
      // Incomplete saved configurations do not have an active feed identity.
      const cfgStr = isFullyConfigured(adapter, config)
        ? configFingerprint(adapter, config)
        : "__unconfigured__"
      return `${adapter.id}:${langId}:${cfgStr}`
    })
    .join("|")
  const currentFeedKey = useRef(activeSourceKey)
  currentFeedKey.current = activeSourceKey
  // Seen history snapshot per feed identity: filters cached batches before
  // first paint and detects an exhausted cache that must be refreshed.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- activeSourceKey re-snapshots per feed identity
  const seenAtFeedAssembly = useMemo(() => getRecentSeenIds(), [activeSourceKey])

  useEffect(() => {
    loadMoreController.current?.abort()
    loadMoreController.current = null
    setIsLoadingMore(false)
    setExtraItemsBySource({})
    extraItemsFeedKey.current = activeSourceKey
    setZenIndex(-1)
    zenRestorePendingRef.current = true
    autoTopUpsRef.current = 0
    // Reset per-adapter dataUpdatedAt tracking when source config changes
    prevDataUpdatedAtRef.current = {}
  }, [activeSourceKey])

  const queryResults = useQueries({
    queries: activeAdapters.map((adapter) => {
      const langId = adapter.id === "wikipedia" ? currentLanguage.id : ""
      // Use the same saved configuration for both the query and feed identity.
      const config = settledConfigs[adapter.id] ?? {}
      // Never include credentials in query or storage keys.
      const configStr = isFullyConfigured(adapter, config)
        ? configFingerprint(adapter, config)
        : "__unconfigured__"
      const cacheKey = feedCache.key(adapter.id, langId, configStr)
      const cached = feedCache.getSync(cacheKey)
      // Only unseen cached items are worth showing instantly. A cached batch
      // whose items were all seen is exhausted: skip it so the query refetches
      // instead of waiting out the TTL on repeats.
      const cachedUnseen = cached?.items?.filter((item) => !seenAtFeedAssembly.has(item.id))
      const cachedExhausted = Boolean(cached?.items?.length) && !cachedUnseen?.length

      return {
        queryKey: ["articles", adapter.id, langId, configStr],
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
          assertSourceConfigured(adapter.id, config.__cacheId)
          const generation = sourceGeneration(adapter.id)
          signal = AbortSignal.any([signal, sourceSignal(adapter.id)])
          try {
            const items = await adapter.fetch({ language: currentLanguage, sourceConfig: config, signal })
            signal.throwIfAborted()
            assertSourceCurrent(adapter.id, generation)
            if (items.length > 0) await commitSourceCache(adapter.id, generation, () => feedCache.set(cacheKey, items))
            return items
          } catch (error) {
            signal.throwIfAborted()
            assertSourceCurrent(adapter.id, generation)
            // An exhausted cache skipped at mount stays available as an error
            // fallback, so a failed refresh never blanks a populated feed.
            if ((adapter.fallbackToCachedDataOnError || cachedExhausted) && cached?.items?.length) {
              return cached.items
            }
            throw error
          }
        },
        enabled: ready && isFullyConfigured(adapter, config),
        refetchOnWindowFocus: false,
        retry: adapter.requiresConfig ? 0 : 1,
        initialData: adapter.showCachedWhileRefetching === false || cachedExhausted ? undefined : cachedUnseen,
        initialDataUpdatedAt: cached?.timestamp ?? 0,
        // Per-adapter override: Memos sets cacheTtlMs=0 so every mount triggers
        // a refetch (advancing the window cursor). It opts out of initialData
        // and uses the cached batch only when that fresh request fails.
        // Other sources use the global TTL and normal stale-while-revalidate.
        staleTime: adapter.cacheTtlMs ?? CACHE_TTL_MS,
      }
    }),
  })

  const allItems = dedup(
    interleaveN(
      activeAdapters.map((adapter, i) => queryResults[i]?.isError && adapter.id === 'weread' ? [] : [
        ...(Array.isArray(queryResults[i]?.data) ? (queryResults[i].data as DiscoveryItem[]) : []),
        ...(extraItemsFeedKey.current === activeSourceKey ? extraItemsBySource[adapter.id] ?? [] : []),
      ])
    )
  )
  // Filter against the feed-start snapshot: content seen before this feed
  // session opened stays out, while items viewed within the session remain
  // navigable back and forth. When every item has been seen, fall back to
  // the full feed rather than leaving the reading screen empty.
  const unseenItems = allItems.filter((item) => !seenAtFeedAssembly.has(item.id))
  const articles = unseenItems.length > 0 ? unseenItems : allItems

  const hasQueryError = articles.length === 0 && queryResults.some((result) => result.isError)
  const sourceErrors = Object.fromEntries(activeAdapters.flatMap((adapter, i) => {
    const result = queryResults[i]
    if (result?.isError) return [[adapter.id, result.error instanceof TypeError ? 'Connection failed. Check permissions, network, or use the Chrome extension.' : result.error.message]]
    if (!isFullyConfigured(adapter, settledConfigs[adapter.id] ?? {})) return [[adapter.id, 'Complete your source settings to connect.']]
    if (result?.isSuccess && result.data?.length === 0) return [[adapter.id, 'No reading content found. Check your account or try another batch.']]
    return []
  }))
  const isLoading = !ready || queryResults.some((result, i) => isFullyConfigured(activeAdapters[i], settledConfigs[activeAdapters[i].id]) && (result.isPending || result.isFetching))
  const retryLoad = useCallback(() => {
    void Promise.all(queryResults.map((result) => result.refetch()))
  }, [queryResults])

  // Detect when a replaceAnchorOnRefetch adapter gets genuinely new data.
  // This effect is declared BEFORE the articles→zenIndex effect so that within
  // the same render batch where queryResults change, we set
  // zenRestorePendingRef.current=true first — then the articles effect below
  // sees it and picks a fresh zenIndex from the new batch.
  const dataUpdatedAtKey = activeAdapters
    .map((a, i) => `${a.id}:${queryResults[i]?.dataUpdatedAt ?? 0}`)
    .join(',')
  // useCallback to avoid stale closure over activeAdapters/queryResults
  const detectRefetch = useCallback(() => {
    activeAdapters.forEach((adapter, i) => {
      if (!adapter.replaceAnchorOnRefetch) return
      const result = queryResults[i]
      if (!result || result.isFetching) return
      const current = result.dataUpdatedAt ?? 0
      if (current === 0) return
      const prev = prevDataUpdatedAtRef.current[adapter.id] ?? 0
      if (current !== prev) {
        const isGenuineRefetch = prev > 0 // prev=0 means very first load; >0 means real refetch
        prevDataUpdatedAtRef.current[adapter.id] = current
        if (isGenuineRefetch) {
          zenRestorePendingRef.current = true
          setAnchorKey((k) => k + 1)
        }
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUpdatedAtKey])
  useEffect(() => { detectRefetch() }, [detectRefetch])

  // Pick a random starting index once articles arrive
  useEffect(() => {
    if (!zenRestorePendingRef.current) return
    if (articles.length === 0) return
    zenRestorePendingRef.current = false
    setZenIndex(Math.floor(Math.random() * articles.length))
  }, [articles])

  // Load more when user navigates near the end
  const loadMore = async () => {
    if (!ready || isLoadingMore || loadMoreController.current || isLoading || activeAdapters.length === 0) return
    const controller = new AbortController()
    loadMoreController.current = controller
    const requestFeedKey = activeSourceKey
    setIsLoadingMore(true)
    try {
      // Top-up batches exclude everything seen up to now, including items
      // viewed within this session, so appended pages never repeat.
      const seenBeforeTopUp = getRecentSeenIds()
      const results = await Promise.allSettled(
        activeAdapters.map(async (adapter) => {
          assertSourceConfigured(adapter.id, settledConfigs[adapter.id]?.__cacheId)
          const generation = sourceGeneration(adapter.id)
          const signal = AbortSignal.any([controller.signal, sourceSignal(adapter.id)])
          const items = (await adapter.fetch({
            language: currentLanguage,
            sourceConfig: settledConfigs[adapter.id] ?? getSourceConfig(adapter.id),
            fetchMode: "more",
            signal,
          })).filter((item) => !seenBeforeTopUp.has(item.id))
          signal.throwIfAborted()
          assertSourceCurrent(adapter.id, generation)
          return [adapter.id, items] as const
        })
      )
      if (controller.signal.aborted || currentFeedKey.current !== requestFeedKey) return
      const next: ItemsBySource = {}
      let failed = false
      for (const result of results) {
        if (result.status === "fulfilled") {
          const [sourceId, items] = result.value
          if (items.length > 0) next[sourceId] = items
        } else {
          failed = true
        }
      }
      if (failed) showToast("Failed to load more articles")
      if (Object.keys(next).length > 0) {
        setExtraItemsBySource((prev) => {
          const updated = { ...prev }
          for (const [sourceId, items] of Object.entries(next)) {
            updated[sourceId as SourceId] = [
              ...(updated[sourceId as SourceId] ?? []),
              ...items,
            ]
          }
          return updated
        })
      }
    } finally {
      if (loadMoreController.current === controller) {
        loadMoreController.current = null
        setIsLoadingMore(false)
      }
    }
  }

  // Seen-filtering can leave the feed short on unseen items. Quietly top up
  // so browsing never stalls on repeats; capped per feed, and user navigation
  // near the end keeps loading through onNearEnd beyond the cap.
  useEffect(() => {
    if (!ready || isLoading || isLoadingMore || activeAdapters.length === 0) return
    if (allItems.length === 0 || unseenItems.length > 5 || autoTopUpsRef.current >= 3) return
    autoTopUpsRef.current += 1
    void loadMore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allItems.length, unseenItems.length, ready, isLoading, isLoadingMore, activeAdapters.length])

  return (
    <ZenMode
      isOpen={true}
      feedKey={activeSourceKey}
      anchorKey={anchorKey}
      sourceErrors={sourceErrors}
      items={articles}
      initialIndex={zenIndex}
      onNearEnd={loadMore}
      isLoading={isLoading}
      loadError={hasQueryError ? "Unable to load content" : undefined}
      onRetry={retryLoad}
    />
  )
}

export default App
