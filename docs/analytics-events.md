# Glimmer extension analytics

Explicitly opted-in pseudonymous usage events for the Chrome extension. The web build keeps Vercel Analytics and does not send these events.

The extension does not load PostHog JavaScript. A bundled client posts to `https://us.i.posthog.com/batch/` with `credentials: 'omit'`. The publishable project key lives only in `frontend/src/analytics/config.ts`. Web builds replace that module with an empty stub.

Consent is **Usage analytics** in Sources. It is off by default. The first new-tab visit prompts once to allow or decline the statistics; declining stores an explicit off choice. Existing installations with no stored consent choice must also opt in before any new events are sent. Consent can be withdrawn at any time. While it is off the client does not call PostHog and does not queue events. Turning it off writes that fact to `chrome.storage.local`, which aborts in-flight sends in every extension context (new-tab pages and the service worker) and drops the queue. Queue, active-day, and install-id updates share one Web Lock, `glimmer-analytics`, so those read-modify-writes stay ordered across contexts. The pseudonymous install id and active-day marker are deleted.

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
| `extension_installed` | `runtime.onInstalled` reason `install`, only if explicitly opted in already (normally absent on a fresh install) | none |
| `extension_updated` | `runtime.onInstalled` reason `update`, and only if consent is already on | `previous_version` (numeric version) |
| `entry_opened` | new-tab document start | `entry`: `newtab` or `action` |
| `content_shown` | first successful reading item in that new-tab document | `source`: `wikipedia`, `hackernews`, `memos`, `hypothesis`, or `weread` |
| `active_day` | first consented activity of the local calendar day | none |
| `settings_changed` | user changes a setting while consent is on | `setting`: `source_enabled`, `source_disabled`, `language`, `theme`, `sync_favorites`, or `analytics_consent`. Source toggles also send `source_id`; theme selection sends the allowlisted `theme_id` |

`analytics_consent` is recorded only when the switch is turned on. Turning it off sends nothing.

Toolbar opens add `?entry=action` locally. The page reads that enum and removes the query. The URL is not an event property.

Anything that is not on the allowlist, including URLs, domains, titles, and free text, drops the event.

## Uninstall

The extension does not send an uninstall event or open a feedback page.

## Manual check

1. Install the unpacked extension with no existing consent choice. Open a new tab: the one-time prompt appears. Before clicking, verify no request to `us.i.posthog.com` and no install ID created. Choose **Not now**; verify the prompt does not appear again and no requests are sent.
2. Turn **Usage analytics** on in Sources, or choose **Share analytics** on a fresh install. The first event may be `settings_changed` with `setting=analytics_consent`.
3. Open another new tab. Expect `entry_opened` (`entry=newtab`), one `content_shown` whose `source` is one of the five source names, and one `active_day`.
4. Open Glimmer from the toolbar. Expect `entry_opened` with `entry=action`.
5. Use the new tab again the same local day. Expect no second `active_day`.
6. Change language, theme, a source, or Sync favorites. Expect `settings_changed` with the setting key; theme selection includes its allowlisted theme ID.
7. On every event, confirm `app=glimmer`, `app_version`, and `browser`, and confirm there is no URL, domain, title, or note text.
8. Turn consent off. Confirm the queue and local installation ID are deleted, and later actions send nothing. Re-enable: verify a new random ID is generated.
9. With consent already on, reload the extension and confirm `extension_updated` includes `previous_version`. A fresh installation must not send an install event without consent.
10. Uninstall and confirm no uninstall event is sent.
