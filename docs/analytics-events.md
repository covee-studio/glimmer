# Glimmer extension analytics

Opt-in anonymous usage events for the Chrome extension. The web build keeps Vercel Analytics and does not send these events.

The extension does not load PostHog JavaScript. A bundled client posts to `https://us.i.posthog.com/batch/` with `credentials: 'omit'`. The publishable project key lives only in `frontend/src/analytics/config.ts`. Web builds replace that module with an empty stub.

Consent is **Help improve Glimmer** in Sources. It is off by default. While it is off the client does not call PostHog and does not queue events. Turning it off writes that fact to `chrome.storage.local`, which aborts in-flight sends in every extension context (new-tab pages and the service worker) and drops the queue. Queue, active-day, and install-id updates share one Web Lock, `glimmer-analytics`, so those read-modify-writes stay ordered across contexts. The anonymous install id is kept.

Every accepted event includes:

| Property | Value |
| --- | --- |
| `app` | `glimmer` |
| `app_version` | `manifest.json` version |
| `browser` | `chrome`, `edge`, `opera`, `brave`, `chromium`, or `other` |
| distinct id | random UUID stored locally, not an account |

`$ip` is set to `null` so PostHog is asked not to store the request IP. The client does not set `$current_url`, cookies, autocapture, session replay, surveys, or feature flags.

## Events

| Event | When | Properties |
| --- | --- | --- |
| `extension_installed` | `runtime.onInstalled` reason `install`, and only if consent is already on | none |
| `extension_updated` | `runtime.onInstalled` reason `update`, and only if consent is already on | `previous_version` (numeric version) |
| `entry_opened` | new-tab document start | `entry`: `newtab` or `action` |
| `content_shown` | first successful reading item in that new-tab document | `source`: `wikipedia`, `hackernews`, `memos`, `hypothesis`, or `weread` |
| `active_day` | first consented activity of the local calendar day | none |
| `settings_changed` | user changes a setting while consent is on | `setting`: `source_enabled`, `source_disabled`, `language`, `theme`, `sync_favorites`, or `analytics_consent`. Source toggles also send `source_id` from the source list above |

`analytics_consent` is recorded only when the switch is turned on. Turning it off sends nothing.

Toolbar opens add `?entry=action` locally. The page reads that enum and removes the query. The URL is not an event property.

Anything that is not on the allowlist, including URLs, domains, titles, and free text, drops the event.

## Uninstall

The extension does not send an uninstall event or open a feedback page.

## Manual check

1. Load the unpacked extension with consent off. Open a new tab and the toolbar icon. No request to `us.i.posthog.com`.
2. Turn **Help improve Glimmer** on. The first event may be `settings_changed` with `setting=analytics_consent`.
3. Open another new tab. Expect `entry_opened` (`entry=newtab`), one `content_shown` whose `source` is one of the five source names, and one `active_day`.
4. Open Glimmer from the toolbar. Expect `entry_opened` with `entry=action`.
5. Use the new tab again the same local day. Expect no second `active_day`.
6. Change language, theme, a source, or Sync favorites. Expect `settings_changed` with the setting key only.
7. On every event, confirm `app=glimmer`, `app_version`, and `browser`, and confirm there is no URL, domain, title, or note text.
8. Turn consent off. Confirm the queue is dropped and later actions send nothing.
9. With consent already on, reload the extension and confirm `extension_updated` includes `previous_version`. A fresh install with the default off switch does not send `extension_installed`.
10. Uninstall and confirm no uninstall event is sent.
