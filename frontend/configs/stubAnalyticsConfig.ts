import type { Plugin } from 'vite'

/**
 * Web and dev builds resolve the analytics config module to an empty stub
 * so the publishable PostHog key stays in the extension package only.
 */
export function stubAnalyticsConfig(): Plugin {
  return {
    name: 'stub-glimmer-analytics-config',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer) return null
      const from = importer.replaceAll('\\', '/')
      if (!from.includes('/src/analytics/')) return null
      if (source !== './config' && source !== './config.ts') return null
      const slash = Math.max(importer.lastIndexOf('/'), importer.lastIndexOf('\\'))
      const separator = importer[slash] ?? '/'
      return `${importer.slice(0, slash)}${separator}config.web-stub.ts`
    },
  }
}
