import { CloseButton } from './ui/CloseButton'
import { usePanelMotion } from './ui/usePanelMotion'
import { ArrowLeft, BookOpen, ChevronDown, Eye, EyeOff, Info, Settings } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "motion/react"
import { useSources } from "../contexts/SourcesContext"
import { useFocusTrap } from "../hooks/useFocusTrap"
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation"
import { useLocalization } from "../hooks/useLocalization"
import { LANGUAGES } from "../languages"
import { ADAPTER_LIST } from "../sources/registry"
import { useToast } from "../contexts/ToastContext"
import type { SourceAdapter } from "../sources/adapter"
import type { SourceId } from "../types/DiscoveryItem"
import { Toggle } from "./Toggle"

interface SourcesModalProps {
  isOpen: boolean
  onClose: () => void
  sourceErrors?: Partial<Record<SourceId, string>>
}

type SourcesView = "sources" | SourceId

function SourceHint({ sourceId, sourceLabel, description }: { sourceId: string; sourceLabel: string; description: string }) {
  const tooltipId = `source-description-${sourceId}`
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<{ left: number; top?: number; bottom?: number; width: number } | null>(null)
  const hovered = useRef(false)
  const focused = useRef(false)

  const open = () => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    const width = Math.min(224, window.innerWidth - 24)
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))
    setPosition(window.innerHeight - rect.bottom >= 88
      ? { left, top: rect.bottom + 8, width }
      : { left, bottom: window.innerHeight - rect.top + 8, width })
  }
  const close = () => {
    if (!hovered.current && !focused.current) setPosition(null)
  }
  useEffect(() => {
    const dismiss = () => setPosition(null)
    window.addEventListener('resize', dismiss)
    window.addEventListener('scroll', dismiss, true)
    return () => {
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('scroll', dismiss, true)
    }
  }, [])

  return (
    <span className="source-tooltip-trigger inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`About ${sourceLabel}`}
        aria-describedby={position ? tooltipId : undefined}
        onMouseEnter={() => { hovered.current = true; open() }}
        onMouseLeave={() => { hovered.current = false; close() }}
        onFocus={() => { focused.current = true; open() }}
        onBlur={() => { focused.current = false; close() }}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-300 transition-colors hover:text-[var(--ui-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
      >
        <Info className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      {position && createPortal(
        <span
          id={tooltipId}
          role="tooltip"
          className="source-tooltip source-tooltip-open pointer-events-none fixed z-[300] rounded-xl bg-slate-800 px-3 py-2 text-[11px] font-normal leading-snug text-white shadow-lg"
          style={position}
        >
          {description}
        </span>, document.body,
      )}
    </span>
  )
}

export function SourcesModal({ isOpen, onClose, sourceErrors = {} }: SourcesModalProps) {
  const panelMotion = usePanelMotion()
  const { enabledSources, toggleSource, getSourceConfig, updateSourceConfig, ensureHostPermission, disconnectSource } = useSources()
  const { showToast } = useToast()
  const { currentLanguage, setLanguage } = useLocalization()
  const [view, setView] = useState<SourcesView>("sources")
  const [settingsDraft, setSettingsDraft] = useState<Record<string, string>>({})
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settingsError, setSettingsError] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const lastOpenedSource = useRef<string | null>(null)
  const settingsAdapter = view === "sources" ? undefined : ADAPTER_LIST.find((adapter) => adapter.id === view)

  useKeyboardNavigation({ onEscape: onClose, enabled: isOpen })
  useFocusTrap(isOpen, containerRef)

  useEffect(() => {
    if (isOpen) return
    setView("sources")
    setSettingsDraft({})
    setShowToken(false)
    setSettingsError('')
  }, [isOpen])

  const openSourceSettings = (adapter: SourceAdapter) => {
    lastOpenedSource.current = adapter.id
    setSettingsDraft({ ...getSourceConfig(adapter.id) })
    setShowToken(false)
    setSettingsError('')
    setView(adapter.id)
  }

  // With a wait transition the incoming view is not mounted on the first frame.
  // Restore focus only once it is visible, without stealing an early user click.
  const focusCurrentView = () => {
    const scope = containerRef.current?.querySelector<HTMLElement>(`[data-source-view="${view}"]`)
    if (!scope || scope.contains(document.activeElement)) return
    const selector = view === "sources" ? `[data-source-settings="${lastOpenedSource.current}"]` : '[data-source-back]'
    scope.querySelector<HTMLButtonElement>(selector)?.focus()
  }


  const saveSourceSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!settingsAdapter || saving) return
    if (settingsAdapter.configSchema?.some(field => field.required !== false && !settingsDraft[field.key]?.trim())) {
      setSettingsError('Complete the required fields before saving.')
      return
    }
    setSaving(true)
    setSettingsError('')
    try {
      if (!await ensureHostPermission(settingsAdapter.id, settingsDraft)) {
        setSettingsError('Allow access to this source to connect it. Your changes have not been saved.')
        return
      }
      for (const field of settingsAdapter.configSchema ?? []) {
        updateSourceConfig(settingsAdapter.id, field.key, settingsDraft[field.key]?.trim() ?? "")
      }
      // Saving a complete configuration also activates the source.
      if (!enabledSources.has(settingsAdapter.id)) {
        toggleSource(settingsAdapter.id, settingsDraft)
      }
      setView("sources")
    } catch {
      setSettingsError('Could not connect this source. Please try again.')
    } finally { setSaving(false) }
  }

  const handleSourceToggle = async (adapter: (typeof ADAPTER_LIST)[number]) => {
    if (!enabledSources.has(adapter.id) && adapter.requiresConfig &&
      adapter.configSchema?.every(field => field.required === false || getSourceConfig(adapter.id)[field.key]?.trim())) {
      if (!await ensureHostPermission(adapter.id)) {
        showToast(`Allow access to ${adapter.label} before enabling it`)
        return
      }
    }
    const toggled = toggleSource(adapter.id)
    if (toggled) return
    if (enabledSources.has(adapter.id)) {
      showToast('Keep at least one source on')
      return
    }

    showToast(`Configure ${adapter.label} before enabling it`)
    if (adapter.requiresConfig) openSourceSettings(adapter)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sources-backdrop"
          {...panelMotion.backdrop}
          className="fixed inset-0 z-50 flex items-center justify-center ui-modal-backdrop p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Sources settings"
        >
          <motion.div
            {...panelMotion.panel}
            ref={containerRef}
            className="reading-panel relative z-[41] flex max-h-[92dvh] w-full max-w-md flex-col overflow-y-auto overscroll-y-contain rounded-2xl p-5 sm:p-7"
            role="document"
          >
            <div className="ui-panel-header">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="ui-panel-title font-serif-editorial">Your reading room</h2>
                </div>
              </div>
              <CloseButton onClick={onClose} />
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {view === "sources" ? (
                <motion.div
                  key="sources-view"
                  data-source-view="sources"
                  onAnimationComplete={focusCurrentView}
                  {...panelMotion.view}
                >
                  <div className="mb-4 flex items-center gap-3 border-b border-[var(--ui-line-soft)] pb-5">
                    <div className="flex min-w-0 flex-1 items-center gap-1">
                      <label htmlFor="article-language-select" className="block text-sm font-medium text-[var(--ui-text)]">
                        Language
                      </label>
                      <SourceHint
                        sourceId="language"
                        sourceLabel="Language"
                        description="Wikipedia articles and Hacker News headline translation"
                      />
                    </div>
                    <div className="relative w-[132px] sm:w-[148px] flex-shrink-0">
                      <select
                        id="article-language-select"
                        value={currentLanguage.id}
                        onChange={(event) => setLanguage(event.target.value)}
                        className="ui-field w-full cursor-pointer appearance-none px-3 py-2 pr-8 text-sm"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.id} value={lang.id}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ui-muted)]" />
                    </div>
                  </div>

                  <div className="flex flex-col divide-y divide-[var(--ui-line-soft)]">
                    {ADAPTER_LIST.map((adapter) => {
                      const active = enabledSources.has(adapter.id)
                      const hasSettings = Boolean(adapter.configSchema?.length)
                      const configured = hasSettings && adapter.configSchema!.every(field => field.required === false || Boolean(getSourceConfig(adapter.id)[field.key]?.trim()))

                      return (
                        <div
                          key={adapter.id}
                          className="source-row relative flex min-h-[80px] items-center px-1 py-4 hover:z-30"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-50 ${active ? "" : "opacity-60"}`}>
                                {adapter.logoSrc ? (
                                  <img
                                    src={adapter.logoSrc}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <BookOpen className="h-5 w-5 text-emerald-800" aria-hidden="true" />
                                )}
                              </span>
                              <div className="flex min-w-0 flex-col items-start gap-1">
                                <div className="flex items-center gap-1">
                                <label
                                  htmlFor={`source-toggle-${adapter.id}`}
                                  className={`cursor-pointer select-none font-medium ${active ? "text-[var(--ui-ink)]" : "text-[var(--ui-muted)]"}`}
                                >
                                  {adapter.label}
                                </label>
                                <SourceHint
                                  sourceId={adapter.id}
                                  sourceLabel={adapter.label}
                                  description={adapter.description}
                                />
                                </div>
                                {hasSettings && <p className="text-xs text-[var(--ui-muted)]">{configured ? "Configured" : "Not connected"}</p>}
                                {sourceErrors[adapter.id] && <p role="status" className="text-[11px] leading-relaxed text-amber-800">{sourceErrors[adapter.id]}</p>}
                              </div>
                            </div>
                            <div className="ml-auto flex items-center gap-3">
                              {hasSettings && (
                                <button
                                  type="button"
                                  data-source-settings={adapter.id}
                                  onClick={() => openSourceSettings(adapter)}
                                  aria-label={configured ? `${adapter.label} settings` : `Connect ${adapter.label}`}
                                  className={`ui-secondary-button`}
                                >
                                  {configured ? <Settings className="h-4 w-4" strokeWidth={1.8} /> : <span className="text-xs">Connect</span>}
                                </button>
                              )}
                              {(!hasSettings || configured) && <Toggle
                                id={`source-toggle-${adapter.id}`}
                                checked={active}
                                onChange={() => handleSourceToggle(adapter)}
                              />}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`${settingsAdapter?.id ?? "source"}-view`}
                  data-source-view={view}
                  onAnimationComplete={focusCurrentView}
                  {...panelMotion.view}
                >
                  <button
                    type="button"
                    data-source-back
                    onClick={() => setView("sources")}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--ui-muted)] transition-colors hover:text-[var(--ui-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                  >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
                    Back to Sources
                  </button>

                  <div className="flex items-center gap-3">
                    {settingsAdapter?.logoSrc ? (
                      <img
                        src={settingsAdapter.logoSrc}
                        alt={settingsAdapter.label}
                        className="h-11 w-11 rounded-full object-contain"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-[var(--ui-muted)]">
                        <BookOpen className="h-5 w-5 text-emerald-800" strokeWidth={1.6} />
                      </div>
                    )}
                    <h3 className="font-serif-editorial text-2xl font-medium tracking-tight text-[var(--ui-ink)]">
                      {settingsAdapter?.label ?? "Source"}
                    </h3>
                  </div>

                  {settingsAdapter?.setupUrl && <div className="mt-4 text-left text-xs leading-relaxed text-[var(--ui-muted)]"><a className="text-emerald-800 underline underline-offset-4" href={settingsAdapter.setupUrl} target="_blank" rel="noopener noreferrer">{settingsAdapter.setupLabel}</a><p className="mt-3">{settingsAdapter.setupHint}</p></div>}
                  <form className="mt-6 flex flex-col gap-5" onSubmit={saveSourceSettings}>
                    {(settingsAdapter?.configSchema ?? []).map((field) => {
                      const isSecret = field.secret === true
                      const value = settingsDraft[field.key] ?? ""

                      return (
                        <div key={field.key}>
                          <label
                            htmlFor={`${settingsAdapter?.id ?? "source"}-${field.key}`}
                            className="mb-2 block text-sm font-medium text-[var(--ui-text)]"
                          >
                            {field.label}
                          </label>
                          <div className="relative">
                            <input
                              id={`${settingsAdapter?.id ?? "source"}-${field.key}`}
                              type={isSecret && !showToken ? "password" : "text"}
                              value={value}
                              placeholder={field.placeholder}
                              onChange={(event) => {
                                setSettingsDraft((previous) => ({ ...previous, [field.key]: event.target.value }))
                              }}
                              className={`ui-field w-full py-3 pl-3.5 text-sm ${isSecret ? "pr-28" : "pr-3.5"}`}
                              autoComplete="off"
                              spellCheck={false}
                              required={field.required !== false}
                            />
                            {isSecret && (
                              <button
                                type="button"
                                onClick={() => setShowToken((previous) => !previous)}
                                className="absolute right-2 top-1/2 z-10 inline-flex -translate-y-1/2 shrink-0 items-center gap-1.5 whitespace-nowrap bg-white px-1 text-xs font-medium text-[var(--ui-muted)] transition-colors hover:text-[var(--ui-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                                aria-label={showToken ? "Hide token" : "Show token"}
                              >
                                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {showToken ? "Hide token" : "Show token"}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {settingsError && <p role="alert" className="text-sm text-amber-800">{settingsError}</p>}
                    <button
                      type="submit"
                      disabled={saving}
                      className="ui-primary-button mt-3 w-full px-4 py-3 text-sm font-medium"
                    >
                      {saving ? 'Connecting…' : 'Save & connect'}
                    </button>
                    {settingsAdapter && Object.keys(getSourceConfig(settingsAdapter.id)).length > 0 && <button type="button" disabled={saving} onClick={() => { void disconnectSource(settingsAdapter.id).catch(() => showToast('Disconnected, but some cached data could not be cleared. Try again.')); setSettingsDraft({}); setView('sources') }} className="text-sm text-[var(--ui-muted)] underline underline-offset-4">Disconnect & remove key</button>}
                    {settingsAdapter?.id === 'weread' && <p className="text-center text-[11px] leading-relaxed text-[var(--ui-muted)]">Your saved highlights stay on this device and are not included in Chrome Sync. Disconnecting keeps your saved collection.</p>}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div
            className="fixed inset-0 z-[40] h-full w-full"
            onClick={onClose}
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
