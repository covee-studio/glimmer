# Glimmer repository and local project rename

Date: 2026-10-11

## Repository

- Same public GitHub repository ID: `947138018`.
- Canonical repository: https://github.com/covee-studio/glimmer
- Local origin: https://github.com/covee-studio/glimmer.git
- GitHub redirects old repository URLs and Git operations. Do not create another repository at `covee-studio/wikinote`, which would break those redirects.
- No GitHub Pages site is configured. The existing homepage URL remains `https://wikinote.puzzlex.tech`; a domain migration is a separate deployment task.

## Version boundary

- Chrome Web Store 2.2.0 was submitted before this repository rename. Keep that submission and its exact package unchanged.
- Submitted ZIP SHA-256: `3662a50b16f5cf124c4602a9104fe7da5a10b7189beb7dac359d2a0e0cd82ab6`.
- Link and developer naming changes are prepared as 2.2.1, not submitted to the store.
- 2.2.1 ZIP SHA-256: `d4a9a249bc938c4f55b5d1e723f64de544b1fc5dc6bf12374ef1c2c39b94c030`.
- The store's submitted homepage/support/privacy links retain their old paths during review; anonymous HTTP checks confirmed the old policy URL resolves to the new repository with HTTP 200. Canonical URLs for the next submission are in `CHROMEWEBSTORE.md`.
- The user chose to retain the existing two Wikinote promotional tiles.

## Compatibility

- Keep extension ID `lnoknbamomadbldpkjkbaibinkaibenk`.
- Keep all `wikinote-*` storage/cache keys and internal event names. A cosmetic rename must not orphan settings, credentials, favorites, recent history or open-tab messages.
- Historical audit documents, evidence file paths and references to the previous brand remain unchanged.
- Physical checkout: `/Users/charles/Developer/glimmer`.
- Old-path compatibility link: `/Users/charles/Developer/wikinote` → `/Users/charles/Developer/glimmer`. The original unpacked Chrome extension path remains available. Do not load the same checkout as a second unpacked extension under its new path merely to rename it: Chrome can assign a different local extension ID and separate its saved settings.
- Codex's saved project label/path is independent of Git and filesystem names. The current chat remains attached to the old path and cannot use ordinary sandboxed file operations while that workspace root is a symlink. The user must add or reopen the real Glimmer directory as a Codex project. The supported tools cannot edit the saved Codex project, and native automation of Codex is prohibited.
- Other computers: update origin to the canonical URL; rename their checkout only after checking their editor, local servers and unpacked-extension paths. Keep a compatibility path where needed.

## Verification

- ESLint, TypeScript, web and extension production builds, packaging and regression checks passed for 2.2.1.
- No reading, storage, source lifecycle or synchronization behavior was changed in this cleanup.
- Original 2.2.0 ZIP hash was rechecked after the 2.2.1 build and remained identical.
- Repository rename was verified through GitHub metadata and anonymous policy URL checks.

## Reversal

The physical move can be reversed by removing only the verified old-path symlink and renaming the same checkout back to `/Users/charles/Developer/wikinote`. Preserve the unpacked extension path/identity and settings before changing its registration. GitHub can be renamed back through repository settings and origin updated accordingly; do not create a replacement repository under either name. Source changes are a normal commit and can be reverted without deleting user data.
