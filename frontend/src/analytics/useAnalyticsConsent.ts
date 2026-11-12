import { useCallback, useEffect, useState } from 'react'
import { isExtension } from '../utils/environment'
import { noteActiveDay, readConsent, readConsentMirror, setAnalyticsConsent, subscribeConsent, track } from './client'

export function useAnalyticsConsent() {
  const [enabled, setEnabled] = useState(() => isExtension && readConsentMirror())
  const [ready, setReady] = useState(!isExtension)

  useEffect(() => {
    if (!isExtension) return
    let cancelled = false
    void readConsent().then((value) => {
      if (cancelled) return
      setEnabled(value)
      setReady(true)
    }).catch(() => {
      if (!cancelled) setReady(true)
    })
    const stop = subscribeConsent((value) => setEnabled(value))
    return () => {
      cancelled = true
      stop()
    }
  }, [])

  const update = useCallback(async (next: boolean) => {
    if (!isExtension || !ready || next === enabled) return
    if (!next) {
      await setAnalyticsConsent(false)
      setEnabled(false)
      return
    }
    await setAnalyticsConsent(true)
    setEnabled(true)
    await track('settings_changed', { setting: 'analytics_consent' })
    await noteActiveDay()
  }, [enabled, ready])

  return { enabled, ready, update, visible: isExtension }
}
