# Glimmer Privacy Policy

Last updated: November 9, 2026

Glimmer is a Chrome extension that turns the new tab page into a quiet reading space. This privacy policy explains what the extension processes, where that data goes, and what controls are available to you.

## Summary

- Glimmer has no Glimmer backend, account system, or advertising.
- Usage analytics are optional, off by default, and limited to anonymous product events. The extension does not track browsing history.
- API tokens and private source credentials are stored locally in the browser and are not uploaded to Glimmer.
- Glimmer sends source-specific requests only to the service selected or configured by you.
- Chrome Sync is optional. It is used only when you explicitly enable “Sync favorites”.
- Only compact favorite previews are synchronized; source credentials and API tokens are never synchronized.
- WeRead (微信读书) favorites are local-only and excluded from Chrome Sync.

## Information processed by the extension

### Settings and local application data

Glimmer stores settings and application data in Chrome storage and, for fast startup compatibility, a local browser mirror. This may include:

- selected language and appearance preferences;
- enabled sources and source configuration;
- locally cached feed items; and
- liked or saved article records.

Memos instance URLs, Memos API tokens, Hypothesis API tokens, optional Hypothesis usernames, and WeRead API Keys are stored locally. They are not sent to Glimmer or stored in Chrome Sync.

### Content from enabled sources

Glimmer retrieves content only from sources enabled by you:

- **Wikipedia**: public article titles, extracts, images, and links.
- **Hacker News**: public story titles, links, scores, authors, timestamps, and comment counts.
- **Memos**: notes and related metadata from the self-hosted Memos endpoint you configure.
- **WeRead (微信读书)**: your notebook index, book and chapter metadata, personal highlights, and reading thoughts. The integration requests only the official notebook, highlight, and personal review endpoints. It does not request full book text or public recommendations.
- **Hypothesis**: annotations visible to your API token, including quotations, annotation text, document metadata, tags, timestamps, and links. Setting a username filters the search to that user; without a username, results may also include other users' public annotations.

Memos and Hypothesis content may contain personal or user-generated information because it is content you or your service account chose to store there. Glimmer displays that content for the reading experience and does not claim ownership of it.

### Chrome Sync favorites

If you explicitly enable “Sync favorites”, Glimmer stores compact favorite previews in Chrome’s `storage.sync` area so they can be available on your other Chrome devices signed into the same Chrome profile. Depending on the source, a preview can include a title, URL, source identifier, a short excerpt or selected quotation, annotation text, tags, and limited display metadata.

Glimmer does not synchronize full private Memos notes, API tokens, source credentials, or WeRead favorites. Chrome processes synced data according to your Chrome account and Google privacy settings. Glimmer does not receive a copy of this synchronized data on its own servers.

### Optional anonymous usage analytics

Glimmer does not send usage analytics unless you turn on **Help improve Glimmer** in the Sources panel. That switch is off by default.

While the switch is off, the extension does not contact the analytics processor and does not store events to send later.

While the switch is on, the extension sends anonymous product events to [PostHog, Inc.](https://posthog.com/privacy) in the United States at `https://us.i.posthog.com`. PostHog processes this opt-in data for Covee Studio. Glimmer does not sell it and does not use it for advertising, credit decisions, or purposes unrelated to understanding and improving the new-tab reading experience.

The extension creates an anonymous install identifier on this device and stores it in Chrome local storage. The identifier is not your Google account, name, or email. Analytics does not use cookies.

Each event includes the product name (`glimmer`), the extension version, and a browser family name (`chrome`, `edge`, `opera`, `brave`, `chromium`, or `other`). The event itself is one of:

- extension installed;
- extension updated, together with the previous version number;
- entry opened, as `newtab` or `action` (the toolbar icon);
- content shown, as a source name only: `wikipedia`, `hackernews`, `memos`, `hypothesis`, or `weread`;
- active on a local calendar day, at most once that day, with no extra fields;
- a setting changed, as a key only: `source_enabled`, `source_disabled`, `language`, `theme`, `sync_favorites`, or `analytics_consent`. Source toggles also include the source name from the list above.

The extension does not send URLs, domains, page titles, article titles, article text, notes, highlights, search queries, API tokens, source credentials, or browsing history. It asks PostHog not to store the IP address of the request.

Install and update events are sent only when the switch is already on. A typical first install does not send an install event, because the switch starts off.

Turning the switch off stops further events immediately and discards anything still waiting to be sent. The local install identifier remains until you clear the extension’s storage or uninstall. Uninstalling does not send an analytics event. Chrome may then open the project’s public issue tracker, which is a placeholder contact page operated by GitHub until a dedicated feedback page exists.

### On-device translation

When supported by the browser and enabled by your language selection, Glimmer uses Chrome’s on-device language APIs to translate supported headlines. Glimmer does not send translation requests to a Glimmer server.

## Where requests are sent

Requests are sent directly from the extension to the relevant source service:

- Wikimedia/Wikipedia public APIs for Wikipedia content;
- the Hacker News Firebase API for Hacker News content;
- `https://i.weread.qq.com/api/agent/gateway` when you enable WeRead and grant access to that host;
- the Hypothesis API when the Hypothesis source is configured;
- the Memos API endpoint entered by you when the Memos source is configured; and
- PostHog at `https://us.i.posthog.com`, only after you turn on Help improve Glimmer.

For Memos, use an HTTPS endpoint. The current Chrome extension's connection security policy does not allow plain HTTP API requests.

Glimmer does not inject scripts into ordinary webpages or monitor your browsing history.

## Sharing and sale

Glimmer does not sell user data. The Chrome extension does not transfer user data to advertising networks or data brokers. Source data is sent to a source service only as needed to retrieve the content requested by you, and Chrome Sync data is handled by Chrome when you explicitly enable synchronization. If you opt in, the anonymous usage events described above are sent to PostHog in the United States.

## Retention and deletion

Local settings, caches, and favorites remain in your browser until you remove them through the extension, clear the extension’s storage, or uninstall the extension. Disconnecting a source removes its key and local fetch caches; saved favorites and recent items are retained until you remove them separately. Disabling Chrome Sync stops this profile's synchronization but does not delete data already stored in your Chrome account. Source services retain data according to their own policies and account controls.

Queued analytics events stay on the device only until they are sent, you turn analytics off, or you clear the extension’s storage. Events PostHog has already received are retained under PostHog’s policies and the Covee Studio project settings. Turning analytics off does not delete events already received by PostHog.

You can:

- disable any source in the Sources panel;
- disconnect a source and remove its credentials from its settings page;
- delete liked articles from the Likes panel;
- disable “Sync favorites” at any time;
- turn off “Help improve Glimmer” at any time; and
- clear Glimmer’s extension data through Chrome’s extension settings.

## Security

Glimmer keeps source credentials in local browser storage and excludes them from Chrome Sync. You are responsible for choosing a trusted Memos endpoint, protecting your API tokens, and using HTTPS for self-hosted services.

Local storage is not an encrypted password vault. Protect access to your browser profile and revoke a key with its source service if it has been exposed. Source-setting changes are shared across open Glimmer tabs. Disconnecting cancels obsolete fetches and clears source fetch caches; it does not revoke the key at its source service.

## Changes to this policy

This policy may be updated when Glimmer’s data practices or features change. The “Last updated” date at the top of this page indicates the latest revision.

## Contact

For privacy questions or requests, open an issue in the project repository:

<https://github.com/covee-studio/glimmer/issues>

Source services have their own privacy policies and terms. Please review them when using those services, including [Wikimedia](https://foundation.wikimedia.org/wiki/Policy:Privacy_policy), [Hypothesis](https://web.hypothes.is/privacy/), and [Google Chrome](https://policies.google.com/privacy).
