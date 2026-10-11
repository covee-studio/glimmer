# Glimmer 2.2.0 release readiness

Date: 2026-10-11
Status: submitted to Chrome Web Store; pending review; automatic publication enabled

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
- SHA-256: `3662a50b16f5cf124c4602a9104fe7da5a10b7189beb7dac359d2a0e0cd82ab6`.
- Independent static review found no remaining confirmed code blocker.

## Original submission checklist (see acceptance and store progress below)

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

## Source hint and WeRead presentation

- Render source hints as fixed body portals so they cannot enlarge the scrolling dialog. Position within viewport bounds; support pointer and keyboard focus; dismiss stale positions on scroll/resize.
- Use the English integration name WeRead from Tencent’s official skill documentation and bundle the unmodified application icon linked by the official homepage. Icon provenance is recorded under `frontend/public/source-icons/README.md`.
- Native Chrome screenshot with the WeRead hint visible showed the official icon and no dialog scrollbar. The unpacked test extension was reloaded.
- ESLint, TypeScript, both production builds, packaging and regression checks passed.

## Store upload progress

- Source main pushed and remote verified at `9ac8ede93c92cd8b8cadf9a3524f36c6606a484e`.
- Public privacy policy fetched anonymously and matched local `PRIVACY.md`.
- Uploaded the versioned ZIP above to the existing item. Dashboard visibly confirmed draft 2.2.0 and live 2.1.0.
- Updated and saved the Glimmer description, including WeRead and local-only WeRead favorites.
- Five existing screenshots showed no old brand labels in the dashboard preview; both optional promotional tiles still say Wikinote. User explicitly chose to retain both promotional tiles.
- Updated and saved permission justifications including optional WeRead access; existing data categories and policy URL verified.
- Final submission confirmation displayed “已将您的扩展程序提交送审”; subsequent dashboard status was “待审核”. Automatic publication after approval was checked. Live release is still 2.1.0 until approval.
