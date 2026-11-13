import { useEffect, useRef, useState } from 'react'
import { readConsentChoice, setAnalyticsConsent, subscribeConsent, noteActiveDay, track } from '../analytics/client'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { isExtension } from '../utils/environment'

/** Appears once until the user explicitly accepts or declines analytics. */
export function AnalyticsConsentPrompt() {
  const [choice, setChoice] = useState<boolean | null | 'loading'>('loading')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useFocusTrap(choice === null, panelRef)

  useEffect(() => {
    if (!isExtension) return
    let active = true
    void readConsentChoice().then((value) => {
      if (active) setChoice(value)
    })
    const unsubscribe = subscribeConsent((value) => {
      if (active) setChoice(value)
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  if (!isExtension || choice !== null) return null

  const decide = async (enabled: boolean) => {
    if (saving) return
    setSaving(true)
    setError(false)
    try {
      await setAnalyticsConsent(enabled)
      setChoice(enabled)
      if (enabled) {
        void track('settings_changed', { setting: 'analytics_consent' })
        void noteActiveDay()
      }
    } catch {
      setError(true)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 p-4">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="analytics-prompt-title"
        aria-describedby="analytics-prompt-description"
        className="reading-panel w-full max-w-md rounded-2xl p-6 shadow-xl sm:p-7"
      >
        <h2 id="analytics-prompt-title" className="font-serif-editorial text-xl font-medium text-[var(--ui-text)]">
          Help improve Glimmer
        </h2>
        <p id="analytics-prompt-description" className="mt-3 text-sm leading-relaxed text-[var(--ui-muted)]">
          Share basic usage statistics with PostHog: new-tab activity, content-source and theme
          selections, setting changes, browser and extension version, and a random installation ID.
          No URLs, article titles, notes, or highlights are sent.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[var(--ui-muted)]">
          Optional. Off unless you agree, and you can turn it off later in Sources.{' '}
          <a
            href="https://github.com/covee-studio/glimmer/blob/main/PRIVACY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[var(--ui-text)]"
          >
            Privacy policy
          </a>
        </p>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            Could not save your preference. Please try again.
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => void decide(false)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--ui-muted)] transition-colors hover:bg-[var(--ui-line-soft)] disabled:opacity-50"
          >
            Not now
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void decide(true)}
            className="rounded-lg bg-[var(--ui-text)] px-4 py-2 text-sm font-medium text-[var(--ui-bg)] transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            Share analytics
          </button>
        </div>
      </div>
    </div>
  )
}
