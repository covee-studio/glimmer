# Glimmer 2.2.0 release readiness

Date: 2026-10-11
Status: release candidate; not submitted or published

## Source and scope

- Published baseline: `b84d7745be797843e8a8d375a48b518594d8aac9` (2.1.0).
- Rename commit: `67a7c11`. DEV integration merge: `9179228`.
- Integrated remote DEV: `1e750ba0c3d5a0f4dd2f09b046e8228d66b51e4a`.
- Product name: Glimmer (栖言); preserve the sunrise logo and existing storage keys.
- Existing Chrome item ID: `lnoknbamomadbldpkjkbaibinkaibenk`.
- WeRead private notebook metadata, highlights and thoughts; no full-book download.
- Fix pagination pairing, official reading links, obsolete fetch/cache writes, shared source settings, and local collection updates across tabs.
- Update package, lockfile, manifest and changelog together to 2.2.0.

## Verified

Using Node 24.21.0:

- 53 tests across 6 files passed. WeRead API tests use mocked responses.
- ESLint and TypeScript checks passed.
- Web and Chrome extension production builds passed.
- Packaging and regression checks passed.
- ZIP root manifest verified: Glimmer, 2.2.0; 30 packaged files.
- Package: `frontend/dist/glimmer-extension-v2.2.0.zip`.
- SHA-256: `264ff4d0d9db2587e3e99cea85482f92ddbcfcbef9f4d18df0907bd9c7cef6ae`.
- Independent static review found no remaining confirmed code blocker.

## Required before submission

- Install this package in Chrome and verify the user-facing reading flow.
- User supplies their Key locally: test WeRead host permission, personal notes, more pages, replacement Key, and disconnect across two tabs. Never store the real Key in Git, logs, or this document.
- Capture updated store screenshots from the tested build.
- Push accepted source and privacy policy to main; verify the public policy URL.
- Update the existing Chrome item’s package, description and privacy declarations, then submit for review.

## Limits and branch cleanup

- Mock tests do not prove live gateway response compatibility or real account behavior.
- Cross-device Chrome Sync chunk-write races are preexisting and were not resolved by local collection locks. WeRead favorites remain excluded from Sync.
- Local `dev` and `codex/pre-reconcile-20260812` are entirely ancestors of main and can be deleted without losing commits.
- Keep remote `DEV` until acceptance and integration into main are complete.

## Local Chrome acceptance update

- User connected a real WeRead account in unpacked 2.2.0 and reported that their test worked. This is a user-reported acceptance result; key replacement, multiple pages and multi-tab disconnect were not independently live-tested.
- Observed the real source rendering a book/chapter and official reading link, without reading or retaining credentials.
- Fixed modal re-creation when ZenMode switches between loading and reading branches by assigning consistent sibling keys to all three modals.
- Reloaded the unpacked extension. Toggled Wikipedia, Hacker News and WeRead through the native Chrome UI: the dialog remained open, its controls persisted and focus remained on the selected switch. Restored the original source selection. No frame-level recording was captured.
- After the modal fix: ESLint, TypeScript/extension build, packaging and regression checks passed.
