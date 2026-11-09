import { ANALYTICS_ALARM, flush, trackRuntimeInstall } from './client'

// TODO(uninstall-feedback): Replace this placeholder when Glimmer has a
// dedicated feedback page. Until then, uninstall opens the public issue
// tracker named in PRIVACY.md. Chrome cannot deliver a PostHog event from
// the extension process during uninstall, so none is sent.
const UNINSTALL_FEEDBACK_URL = 'https://github.com/covee-studio/glimmer/issues'

interface InstalledDetails {
  reason: string
  previousVersion?: string
}

interface ClickedTab {
  windowId?: number
}

interface ChromeBackground {
  runtime: {
    getURL: (path: string) => string
    setUninstallURL: (url: string) => void
    onInstalled: {
      addListener: (listener: (details: InstalledDetails) => void) => void
    }
  }
  alarms: {
    onAlarm: {
      addListener: (listener: (alarm: { name: string }) => void) => void
    }
  }
  action: {
    onClicked: {
      addListener: (listener: (tab: ClickedTab) => void) => void
    }
  }
  tabs: {
    create: (properties: { url: string; active: boolean; windowId?: number }) => Promise<unknown>
  }
}

function browser(): ChromeBackground | undefined {
  return (globalThis as unknown as { chrome?: ChromeBackground }).chrome
}

function register() {
  const api = browser()
  if (!api?.runtime || !api.action || !api.tabs) return
  try {
    api.runtime.setUninstallURL(UNINSTALL_FEEDBACK_URL)
  } catch {
    // The placeholder is best-effort and must not break the toolbar action.
  }
  api.runtime.onInstalled.addListener((details) => {
    void trackRuntimeInstall(details)
  })
  api.alarms?.onAlarm.addListener((alarm) => {
    if (alarm.name === ANALYTICS_ALARM) void flush()
  })
  api.action.onClicked.addListener((tab) => {
    const windowId = Number.isInteger(tab?.windowId) ? tab.windowId : undefined
    void api.tabs.create({
      url: api.runtime.getURL('newtab.html?entry=action'),
      active: true,
      ...(windowId === undefined ? {} : { windowId }),
    }).catch((error: unknown) => {
      console.error('Unable to open Glimmer:', error)
    })
  })
  void flush()
}

register()
