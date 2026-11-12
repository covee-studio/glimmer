import { ANALYTICS_ALARM, flush, trackRuntimeInstall } from './client'

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
