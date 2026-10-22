import { Clock3, Cloud, CloudOff, Download, Heart, Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useLikedArticles } from "../contexts/LikedArticlesContext"
import { useI18n } from "../hooks/useI18n"
import { useFocusTrap } from "../hooks/useFocusTrap"
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation"
import { getAdapter } from "../sources/registry"
import { Toggle } from "./Toggle"
import type { DiscoveryItem } from "../types/DiscoveryItem"

interface LikesModalProps {
  isOpen: boolean
  onClose: () => void
}

function recentDomain(item: DiscoveryItem) {
  try { return new URL(item.url).hostname.replace(/^www\./, '') }
  catch { return getAdapter(item.source).label }
}

function SourceBadge({ item }: { item: DiscoveryItem }) {
  const adapter = getAdapter(item.source)
  return (
    <div title={adapter.label} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 p-0.5">
      {adapter.logoSrc ? (
        <img src={adapter.logoSrc} alt="" className="h-full w-full rounded-full object-contain" />
      ) : (
        <span className="text-sm font-semibold text-slate-500">{adapter.label.slice(0, 1)}</span>
      )}
    </div>
  )
}

export function LikesModal({ isOpen, onClose }: LikesModalProps) {
  const { t } = useI18n()
  const {
    likedArticles,
    recentArticles,
    toggleLike,
    isLiked,
    clearRecent,
    syncAvailable,
    syncEnabled,
    syncStatus,
    setSyncEnabled,
  } = useLikedArticles()
  const [activeTab, setActiveTab] = useState<"saved" | "recent">("saved")
  const [tabWasChosenByUser, setTabWasChosenByUser] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [syncOpen, setSyncOpen] = useState(false)
  const syncRef = useRef<HTMLDivElement>(null)
  const [removedItem, setRemovedItem] = useState<DiscoveryItem | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const undoButtonRef = useRef<HTMLButtonElement>(null)
  const restoreFocusId = useRef<string | null>(null)

  useEffect(() => {
    if (removedItem) undoButtonRef.current?.focus()
    else if (restoreFocusId.current) {
      const button = Array.from(containerRef.current?.querySelectorAll<HTMLButtonElement>('[data-remove-item]') ?? [])
        .find(node => node.dataset.removeItem === restoreFocusId.current)
      if (button) { button.focus(); restoreFocusId.current = null }
    }
  }, [removedItem, likedArticles])

  useKeyboardNavigation({
    onEscape: () => {
      if (syncOpen) {
        setSyncOpen(false)
        syncRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
      } else onClose()
    },
    enabled: isOpen,
  })
  useFocusTrap(isOpen, containerRef)

  // Saved is the natural entry point when the user has deliberately kept
  // something. Recent is a recovery surface, so it becomes the default only
  // when there is nothing saved. Do not override a tab the user has chosen
  // during this open session (including while storage is still hydrating).
  useEffect(() => {
    if (!isOpen) {
      setTabWasChosenByUser(false)
      setSyncOpen(false)
      setRemovedItem(null)
      restoreFocusId.current = null
      return
    }
    if (!tabWasChosenByUser) {
      setActiveTab(likedArticles.length > 0 ? "saved" : "recent")
    }
  }, [isOpen, likedArticles.length, tabWasChosenByUser])

  useEffect(() => {
    if (!syncOpen) return
    const dismiss = (event: PointerEvent) => {
      if (!syncRef.current?.contains(event.target as Node)) setSyncOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [syncOpen])

  const articles: Array<{ item: DiscoveryItem; seenAt?: number }> = activeTab === "saved"
    ? likedArticles.map((item) => ({ item }))
    : recentArticles
  const filteredArticles = articles.filter(({ item }) =>
    getAdapter(item.source).getSearchText(item).toLowerCase().includes(searchQuery.trim().toLowerCase())
  )

  const formatSeenAt = (seenAt: number) => {
    const seconds = Math.max(0, Math.floor((Date.now() - seenAt) / 1000))
    if (seconds < 60) return "Just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    if (hours < 48) return "Yesterday"
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(seenAt))
  }

  const handleExport = () => {
    const data = likedArticles.map((item) => getAdapter(item.source).getExportData(item))
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const filename = `glimmer-favorites-${new Date().toISOString().split("T")[0]}.json`
    const link = document.createElement("a")
    link.setAttribute("href", dataUri)
    link.setAttribute("download", filename)
    link.click()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="likes-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="collection-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            ref={containerRef}
            className="reading-panel z-[41] p-5 sm:p-8 rounded-2xl w-full max-w-2xl h-[min(760px,88dvh)] flex flex-col relative"
            style={{
              boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            }}
            role="document"
          >
            <div className="mb-7 flex items-center justify-between gap-3">
              <h2 id="collection-title" className="font-serif-editorial text-2xl font-medium text-slate-800">{t("likes.title")}</h2>
              <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-slate-500" aria-label={t("common.close")}><X className="h-4 w-4" /></button>
            </div>
            <div className="relative mb-4 flex items-start justify-between border-b border-slate-100">
            <div className="flex" role="tablist" aria-label="Collection views">
              {(["saved", "recent"] as const).map((tab) => {
                const selected = activeTab === tab
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    id={`collection-tab-${tab}`}
                    aria-controls="collection-panel"
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    onKeyDown={(event) => {
                      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
                      event.preventDefault()
                      const next = event.key === 'Home' ? 'saved' : event.key === 'End' ? 'recent' : tab === 'saved' ? 'recent' : 'saved'
                      setTabWasChosenByUser(true)
                      setActiveTab(next)
                      setSyncOpen(false)
                      setSearchQuery('')
                      document.getElementById(`collection-tab-${next}`)?.focus()
                    }}
                    onClick={() => {
                      setTabWasChosenByUser(true)
                      setActiveTab(tab)
                      setSyncOpen(false)
                      setSearchQuery("")
                    }}
                    className={`relative px-4 pb-2.5 text-sm transition-colors ${selected ? "font-medium text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    {t(`likes.${tab}`)} <span className="ml-1.5 text-xs font-normal text-slate-400">{tab === "saved" ? likedArticles.length : recentArticles.length}</span>
                    {selected && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-slate-800" />}
                  </button>
                )
              })}
            </div>

            {activeTab === "saved" && syncAvailable && (
              <div ref={syncRef} className="relative">
                <button
                  type="button"
                  aria-label={`Favorite sync: ${syncStatus === "error" ? "needs attention" : syncEnabled ? "enabled" : "off"}`}
                  title={syncStatus === "error" ? "Sync needs attention" : syncEnabled ? "Favorite sync is on" : "Favorites stay on this device"}
                  aria-expanded={syncOpen}
                  aria-controls="favorite-sync-settings"
                  onClick={() => setSyncOpen(!syncOpen)}
                  className={`flex h-9 w-10 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-slate-500 ${syncStatus === "error" ? "text-amber-700" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {syncStatus === "error" ? <CloudOff className="h-4 w-4" /> : <Cloud className="h-4 w-4" />}
                  {syncStatus === "error" && <span className="sr-only">Sync needs attention</span>}
                </button>
                {syncOpen && (
                  <div id="favorite-sync-settings" role="region" aria-label="Favorite sync settings" className="absolute right-0 top-11 z-20 w-[min(304px,calc(100vw-80px))] rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.10)]">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-sm font-medium text-slate-800">Sync favorites</h3>
                      <Toggle checked={syncEnabled} onChange={() => setSyncEnabled(!syncEnabled)} ariaLabel="Sync favorites across Chrome devices" />
                    </div>
                    <p role="status" className={`mt-2 text-xs ${syncStatus === "error" ? "text-amber-800" : "text-slate-500"}`}>
                      {syncStatus === "syncing" ? "Syncing with Chrome…" : syncStatus === "synced" ? "Synced with Chrome" : syncStatus === "error" ? "Sync unavailable. Check Chrome Sync." : "Saved on this device"}
                    </p>
                    <p className="mt-4 text-xs leading-relaxed text-slate-500">Only favorite previews sync across Chrome devices. API keys and WeRead favorites stay on this device.</p>
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Search */}
            {articles.length > 0 && <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={activeTab === "saved" ? t("likes.search") : t("likes.searchRecent")}
                placeholder={activeTab === "saved" ? t("likes.search") : t("likes.searchRecent")}
                className="w-full text-slate-800 px-4 py-2.5 pl-10 pr-11 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder-slate-400"
              />
              {searchQuery && <button type="button" aria-label="Clear search" onClick={() => {
                setSearchQuery('')
                containerRef.current?.querySelector<HTMLInputElement>('input')?.focus()
              }} className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-slate-500"><X className="h-4 w-4" /></button>}
              <Search aria-hidden className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            }
            {/* List */}
            <div role="tabpanel" id="collection-panel" aria-labelledby={`collection-tab-${activeTab}`} className="flex-1 overflow-y-auto min-h-0">
              {filteredArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    {activeTab === "saved"
                      ? <Heart className="w-7 h-7 text-slate-400" />
                      : <Clock3 className="w-7 h-7 text-slate-400" />}
                  </div>
                  <p className="text-slate-700 text-base font-medium">
                    {searchQuery ? t("likes.noMatches") : activeTab === "saved" ? t("likes.noLikedArticles") : t("likes.noRecentArticles")}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    {searchQuery ? t("likes.tryDifferentSearch") : activeTab === "saved" ? t("likes.startLiking") : "The last things you opened will appear here"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100">
                  {filteredArticles.map(({ item, seenAt }) => {
                    const adapter = getAdapter(item.source)
                    const preview = adapter.getLikePreview(item)
                    return (
                      <div
                        key={item.id}
                        className="group rounded-lg px-2 py-4 transition-colors duration-200 hover:bg-slate-50/80"
                      >
                        <div className="flex gap-3.5 items-start">
                          {activeTab === "recent" ? <SourceBadge item={item} /> : preview.thumbnailNode && <div className="shrink-0 [&>*]:h-10 [&>*]:w-10">{preview.thumbnailNode}</div>}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <a
                                href={item.url || undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`font-medium text-slate-800 transition-colors line-clamp-2 ${preview.titleHoverClass}`}
                              >
                                {item.title}
                              </a>
                              {activeTab === "saved" ? (
                                <button
                                  data-remove-item={item.id}
                                  onClick={() => { setTabWasChosenByUser(true); toggleLike(item); setRemovedItem(item) }}
                                  className="text-slate-400 hover:text-red-500 flex h-8 w-8 shrink-0 items-center justify-center rounded-full opacity-60 group-hover:opacity-100 focus-visible:opacity-100 transition-colors"
                                  aria-label={t("likes.remove")}
                                  title={t("likes.remove")}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              ) : null}
                            </div>
                            {activeTab === 'recent' ? <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs text-slate-500">
                              <span className="min-w-0 truncate">{recentDomain(item)}</span>
                              {seenAt && <time className="shrink-0" dateTime={new Date(seenAt).toISOString()}>{formatSeenAt(seenAt)}</time>}
                            </div> : (preview.descriptionNode ?? (
                              <p className="text-sm text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                                {preview.descriptionText}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            {removedItem && <div role="status" className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-3 text-xs text-slate-500"><span>Removed from favorites</span><button ref={undoButtonRef} type="button" className="min-h-10 rounded-lg px-3 font-medium text-slate-800 hover:bg-slate-100" onClick={() => { restoreFocusId.current = removedItem.id; if (!isLiked(removedItem)) toggleLike(removedItem); setRemovedItem(null) }}>Undo</button></div>}
            {((articles.length > 0 && !searchQuery.trim()) || activeTab === "saved") && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                {activeTab === "saved" && !syncAvailable ? (
                  <span
                    role="img"
                    aria-label={syncAvailable && syncEnabled ? syncStatus === "synced" ? "Synced with Chrome" : syncStatus === "syncing" ? "Syncing…" : syncStatus === "error" ? "Sync needs attention" : "Sync enabled" : "On this device"}
                    title={syncAvailable && syncEnabled ? syncStatus === "synced" ? "Synced with Chrome" : syncStatus === "syncing" ? "Syncing…" : syncStatus === "error" ? "Sync needs attention" : "Sync enabled" : "On this device — favorites are saved in this browser"}
                    className={`inline-flex h-9 w-8 items-center justify-center rounded-lg ${syncStatus === "error" ? "text-amber-700" : "text-slate-400"}`}
                  >
                    {syncStatus === "error" ? <CloudOff className="h-3.5 w-3.5" /> : <Cloud className="h-3.5 w-3.5" />}
                  </span>
                ) : <span />}

                {articles.length > 0 && !searchQuery.trim() &&
                <button type="button" onClick={activeTab === "saved" ? handleExport : clearRecent} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-slate-500">
                  {activeTab === "saved" && <Download className="h-3.5 w-3.5" />}
                  {activeTab === "saved" ? t("likes.export") : t("likes.clearRecent")}
                </button>}
              </div>
            )}
          </motion.div>

          <div
            className="w-full h-full z-[40] fixed inset-0"
            onClick={onClose}
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
