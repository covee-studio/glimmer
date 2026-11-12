# Chrome Web Store Listing — Glimmer

> Last Updated: 2026-10-28

## Next submission — usage analytics (code not yet submitted)

Version in this tree is still **2.3.1**. Do not upload a package or change the live dashboard until a later version bump. When that package is submitted, update the dashboard as follows. The published 2.3.1 listing does not include this behavior.

- Single purpose and detailed description: use the drafts below. They still say Glimmer does not track browsing history. They also disclose the default-on, user-controllable pseudonymous usage analytics.
- Privacy policy URL: unchanged, `https://github.com/covee-studio/glimmer/blob/main/PRIVACY.md`, after this policy is on `main`.
- Data use: check **User activity**. Do not check Web history. The activity is not browsing history.
- Certification: still check all three Limited Use boxes. Data is not sold, not used for unrelated purposes, and not used for creditworthiness or lending. The single purpose of the optional events is to improve the new-tab reading experience.
- Processor: PostHog, Inc., United States (`https://us.i.posthog.com`). Not sold. No remote code: the capture client is bundled. No PostHog script is downloaded.
- New permission: `alarms`, used only to retry the analytics queue. `alarms` is not a Chrome permission-warning permission. No PostHog host permission was added, so this change does not add a “Read and change your data on us.i.posthog.com” warning.
- Remote code answer remains **No**.

## 2.3.1 patch — 2026-10-28

Clicking the toolbar icon opens Glimmer in a new active tab in the same window. No additional permissions or data access. Verified in the local unpacked Chrome extension; included in 2.3.1, submitted for review.

## Current release status

**2.3.1 submitted and pending review (2026-10-28).** Automatic publication is disabled; publish manually after approval. Dashboard currently shows 2.3.0 as published. See [submission record](docs/releases/2.3.1.md). Historical notes below describe earlier submissions.

## Branding update

- Extension name: **Glimmer – A New Tab for Discovery**
- Short name: **Glimmer**
- Chinese brand: **栖言**
- Existing sunrise logo is retained.
- Status: 2.2.0 submitted for review on 2026-10-11; automatic publication after approval enabled.
- Five existing screenshots retained. Two optional promotional tiles still show Wikinote and were retained at the user’s explicit request.
- Repository renamed to `covee-studio/glimmer`; old GitHub URLs redirect. Store 2.2.0 remains pending review with its submitted URLs.
- Publisher, contact email, category, and distribution: retain the existing dashboard values; verify them before submission.

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 2.2.1 | 2026-10-11 | Repository rename and canonical product links | Prepared; not submitted |
| 2.2.0 | 2026-10-11 | Rename to Glimmer, add WeRead, improve source lifecycle and local collections | Pending review |


This guide describes Glimmer 2.2.0 submitted for review; it does not confirm publication. Keep it aligned with `frontend/configs/extension/manifest.json`, `README.md`, and the root [`PRIVACY.md`](PRIVACY.md).

## Current development build

- Extension version: `2.2.1` (not submitted)
- Manifest: `frontend/configs/extension/manifest.json`
- Build output: `dist/extension/`
- Submission package: `dist/glimmer-extension-v2.2.1.zip`
- Privacy policy source: [`PRIVACY.md`](PRIVACY.md)
- Public privacy policy URL after it is pushed to `main`:
  `https://github.com/covee-studio/glimmer/blob/main/PRIVACY.md`

## Store description

### Single purpose description

```text
Glimmer replaces the Chrome new tab page with a calm reading space that presents one randomly selected item at a time from enabled sources such as Wikipedia, Hacker News, the user's Memos notes, Hypothesis annotations, and WeRead book highlights and reading thoughts. Users can discover and revisit knowledge, save favorites, optionally sync compact favorite previews through Chrome Sync, and translate supported headlines with Chrome's on-device language APIs. Glimmer does not inject content into ordinary webpages, display ads, or track browsing history. By default, the extension sends pseudonymous product-usage events (entry, content source, and setting keys and the selected theme) to PostHog in the United States. Users can turn it off in settings.
```

### Short description

```text
A quiet new tab to discover articles and revisit notes, annotations, and book highlights.
```

### Detailed description

```text
Turn every new tab into a quiet moment of discovery.

Glimmer presents one carefully formatted item at a time from the sources you choose:

• Wikipedia articles in 40 languages
• Hacker News stories
• Your own notes from a self-hosted Memos instance
• Your Hypothesis annotations
• Your WeRead (微信读书) book highlights and reading thoughts, using your personal API Key

Save items you want to revisit, optionally sync compact favorite previews across Chrome devices, and use Chrome's supported on-device language APIs to translate headlines. Glimmer has no ads, no browsing-history tracking, and no Glimmer account or backend.

Help improve Glimmer is on by default and can be disabled in Sources. While enabled, Glimmer sends pseudonymous usage events to PostHog in the United States: which entrance you used, which source was shown, and which setting changed and which theme was selected. It does not send page addresses, titles, notes, or browsing history. You can turn it off at any time.

Glimmer is open source:
https://github.com/covee-studio/glimmer
```

## Permissions

### `storage`

```text
Glimmer uses Chrome storage to persist language and appearance preferences, enabled sources, local feed cache, source configuration, and liked article records so the new-tab reading experience can be restored across browser sessions. When the user explicitly enables Sync favorites, compact favorite previews are stored in Chrome Sync. API tokens and private source credentials remain local and are not synchronized. Glimmer does not send this data to a Glimmer server.
```

### `unlimitedStorage`

```text
Glimmer stores cached feed data, liked articles, and compact source previews locally so users can revisit content across browser sessions. The additional capacity supports larger personal reading histories and cached content without relying on the normal extension storage quota. It is used only for Glimmer's reading and favorites features.
```

### `alarms`

```text
Glimmer uses alarms only to retry a small queue of pseudonymous usage events when the first send fails. No alarm is scheduled while Help improve Glimmer is off or the queue is empty. The alarm does not read browsing data, page content, or tabs. This permission does not show a Chrome permission warning.
```

### Host permission: `https://*.wikipedia.org/*`

```text
Glimmer uses Wikipedia host access to retrieve public article titles, extracts, images, and links for the new-tab reading experience. Requests are made only for Wikipedia content selected by the enabled Wikipedia source. The extension does not inject scripts into Wikipedia pages or monitor browsing activity.
```

### Host permission: `https://hacker-news.firebaseio.com/*`

```text
Glimmer uses the public Hacker News Firebase API to retrieve story titles, links, and related public metadata for the enabled Hacker News source. This access is required to populate the new-tab reading experience. The extension does not access private account data or monitor browsing activity.
```

### Host permission: `https://hypothes.is/*`

```text
Glimmer uses the Hypothesis API to retrieve annotations for the Hypothesis account identified by the personal API token entered by the user. This access is required to display the user's selected quotations, annotation text, document metadata, and links in the new-tab reading experience. The token is stored locally and is sent only to Hypothesis. The extension does not inject scripts into Hypothesis pages or monitor browsing activity.
```

### Optional host permission: `https://i.weread.qq.com/*`

```text
Glimmer requests this host only when the user connects WeRead. It sends the locally entered personal API Key to Tencent’s official Agent Gateway to retrieve notebook metadata, personal book highlights, and reading thoughts. It does not retrieve full books, use login cookies, or monitor browsing activity. The Key and WeRead favorites remain local and are excluded from Chrome Sync.
```

### Optional host permissions: user-configured Memos endpoint

```text
Glimmer requests access only to the self-hosted Memos endpoint entered by the user and only when the Memos source is configured. The access is required to retrieve the user's notes and related metadata. The Memos API token is stored locally and sent only to that configured endpoint. Glimmer does not send Memos content or credentials to a Glimmer server and does not access unrelated pages.
```

## Remote code

Select:

```text
No, I am not using remote code
```

Glimmer fetches data from public and user-configured APIs, but all JavaScript shipped by the extension is included in the extension package. API responses are treated as data; the extension does not download or execute remote JavaScript. Usage events are sent with a bundled HTTP client. The extension does not load PostHog's JavaScript from PostHog's servers.

## Privacy and data usage

### Privacy policy URL

After `PRIVACY.md` has been pushed to the public `main` branch, enter:

```text
https://github.com/covee-studio/glimmer/blob/main/PRIVACY.md
```

Do not use the repository homepage as a substitute for the privacy policy.

### Data categories

Select the categories that exist in the current dashboard and accurately describe the extension:

- Personally identifiable information — source usernames may be supplied for Hypothesis.
- Authentication information — Memos and Hypothesis API tokens and WeRead API Keys are entered by the user and stored locally.
- Website content — Wikipedia, Hacker News, Memos, Hypothesis, and WeRead content is retrieved or displayed by the extension.

If the dashboard does not offer a separate “User-generated content” category, do not invent one or select an unrelated category. The privacy policy explains that Memos notes, Hypothesis quotations/annotation text, and WeRead highlights/thoughts may contain user-generated content.

- User activity — enabled by default, unless the user turns off Help improve Glimmer. Pseudonymous events record install or update, new-tab versus toolbar entry, the content source that was shown (an enum), one activity marker per local day, and the key of a changed setting and selected theme when applicable. Not collected: URLs, domains, page titles, article titles or text, notes, tokens, or browsing history. Processor: PostHog, Inc. in the United States.

Do not select health information, financial or payment information, personal communications, location, or web history.

Check all three Limited Use certifications:

- user data is not sold or transferred for unrelated purposes;
- user data is not used or transferred for unrelated purposes; and
- user data is not used or transferred for creditworthiness or lending.

## Build and verify

Run from `frontend/`:

```bash
npm run lint
npx tsc -b
npm run verify:regressions
npm run build:extension
npm run pack:extension
```

Before uploading, verify that the package contains the current version in `manifest.json` and that no API tokens, local configuration, or development files are present.

## Submission sequence

1. Push the privacy policy and release changes to the public `main` branch.
2. Confirm the privacy policy URL opens in an incognito window.
3. Upload the new extension zip in the Chrome Web Store Developer Dashboard.
4. Update the Privacy fields using the text above.
5. Click **Save draft** and resolve validation errors.
6. Review the package, permissions, and data disclosures.
7. Click **Submit for review** only after the final local installation test passes.

Version 2.2.0 adds an optional WeRead connection and its private reading data. WeRead favorites are local-only; update the authentication and website-content disclosures. Upload it as an update to the existing store item, preserving extension ID `lnoknbamomadbldpkjkbaibinkaibenk`. Before submission, choose a version higher than the live store version and align the package, lockfile, manifest, and changelog.
