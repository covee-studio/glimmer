# Glimmer core experience audit — 2026-10-22

## Verdict and scope

The core reading surface has a clear identity and does not need a new layout in this pass. The largest confirmed gaps were recovery from slow loading, collection search/removal, keyboard semantics, and oversized source-setup branding. Address those before adding more themes or audio.

This run used the actual local web application, real Hacker News and Wikipedia content, current in-app browser screenshots, keyboard actions and DOM observations. It is not store-extension acceptance or a WCAG certification. The source theme and original enabled-source settings were restored; the temporary saved article was removed after testing. Automatic Recent entries from visiting test content remain, and no existing history was cleared. No key was entered or exposed, and no account was disconnected.

## Flow evidence

All screenshots below were captured and visually inspected in this run. Paths are relative to `docs/screenshots/2026-10-22/core-audit/`.

| Step | Task and screenshot | Assessment |
| --- | --- | --- |
| 1 | Reading entry, real HN headline: `01-reading.jpg` | Clear central hierarchy; preserve the homepage composition. |
| 2 | Recent list: `02-recent.jpg` → `10-recent-after.jpg` | Repeated large source badges, names and score/comment descriptions compete with titles. Now smaller badges, title first, quieter domain/time metadata. Stored data and Saved descriptions retained. |
| 3 | Saved empty state: `03-saved-empty.jpg` | Stable, calm empty state. No redesign needed; storage-status tooltip retained. |
| 4 | Source list: `04-sources.jpg`, `07-source-guard-fixed.jpg` | Last enabled source cannot turn off; its rejection was silent. Now announces “Keep at least one source on” through the existing toast. Confirmation is from live DOM status; the screenshot shows the unchanged enabled source, not the short-lived toast. |
| 5 | WeRead setup: `05-weread-setup.jpg` → `08-weread-after.jpg` | Oversized centered brand header pushes the task downward. Now a smaller left-aligned identity and tighter structure; setup instructions/privacy copy retained. Empty-key submit returned focus to the required input without entering a key. |
| 6 | Search no results: `06-search-no-match.jpg` → `11-search-after.jpg` | Previously no direct clear-search control while Clear recent remained visible. Now clear-search returns focus to input; bulk action/footer hidden while filtering. Whitespace trimmed when searching. |
| 7 | Wikipedia loading: `09-wikipedia-loading.jpg` | Loading was observed for an extended period. Source code had no deadline and ignored caller cancellation; now one 15-second deadline spans a fetch's batches and the caller signal is respected. Existing React Query retry can make final failure take roughly 31 seconds. Network later returned actual content; no fabricated error screenshot is claimed. |
| 8 | Real encyclopedia reading: `12-wikipedia-reading.jpg` | Actual title and multi-line summary remain centered and bounded. Current summary truncation is existing intentional preview behavior, not full-article rendering. Extreme note/highlight lengths are not fully covered by this example. |
| 9 | Save → remove → Undo: `13-undo.jpg` | Removal lost focus when its button unmounted. Now focus goes to Undo, then back to the restored item's remove control. Verified actual Saved 1 → Saved 0 → Saved 1; temporary saved article subsequently removed to restore initial Saved 0. |
| 10 | About: `14-about.jpg` | Full product story and Glimmer GitHub link verified. Copy unchanged. Add accessible dialog name; decorative backdrop removed from keyboard/read-screen controls. |
| 11 | Appearance: `15-themes.jpg` | Fifteen themes plus Random visible. Campfire → Waves sampled over 120 actual animation frames: zero opacity decreases; finish with one layer at opacity 1. Original Campfire selection restored afterward. This is one sampled transition, not every pair or GPU. |
| 12 | Narrow collection/setup: `16-collection-narrow.png`, `17-setup-narrow.png` | At 375×667, collection panel x=16..359 and y≈40..627, no horizontal overflow. Long recent titles clamp correctly; input and setup CTA remain visible. Temporary viewport reset. |

## Changes ranked by impact

| Priority | Confirmed issue | Outcome |
| --- | --- | --- |
| P1 | Wikipedia request can stay pending without a source deadline; switching sources does not cancel adapter fetch | Added deadline, caller cancellation and timer cleanup. Two regression tests exercise stalled-request termination and cancellation. |
| P1 | Last-source toggle silently refuses the action | Existing keep-one-source rule preserved, clear status feedback added. |
| P1 | Collection removal/Undo loses keyboard focus | Focus explicitly follows the action and restoration. |
| P2 | Search has no one-click recovery; unrelated bulk delete remains beside an empty filtered list | Clear search control with input focus restoration; bulk actions hidden during search. |
| P2 | Collection tabs lack arrow navigation, roving focus and panel associations; collection/About dialogs lack accessible names | ArrowLeft/ArrowRight/Home/End, roving tab stop, linked tabpanel, named dialogs. Visible Close and Escape remain keyboard exits; decorative overlays no longer appear as additional Close buttons. |
| P2 | Recent records repeat source name, icon, scores and comments before user finds a title | Present title first, small source icon with source-name tooltip, domain and time below. Saved previews keep their descriptions. |
| P2 | Connection setup looks like a landing page rather than a focused form | Smaller identity, aligned content and shorter visual path to the input. |
| P3 | English UI dates use system locale and can switch to Chinese month labels | Explicit English date formatter, matching current English-only UI policy. |
| P3 | Loading indicator lacks a named status | Add accessible loading status without extra visible copy. |

## Verification

- 60 tests passed; 2 new Wikipedia timeout/cancellation regression tests.
- ESLint, extension build, web build, regression script, whitespace check passed.
- Clear search: query emptied, list returned, focus returned to search.
- ArrowLeft on Recent selected Saved and moved focus to its tab; Escape closed collection and returned focus to Liked.
- Save/remove/Undo focus verified; existing collection restored.
- Last-source guard retained Hacker News enabled and emitted its status message.
- Real Wikipedia content eventually loaded; HN-only selection restored at end.
- About text, GitHub target and source setup instructions retained.
- Theme transition sampled; viewport override cleared.

## Remaining gates and recommended sequence

1. Reading templates: evaluate actual connected Memos, WeRead highlights/thoughts, Hypothesis, long notes and varied image aspect ratios. This pass does not claim real-account connection success or inspect stored credentials.
2. Extension acceptance: Chrome sync on/off, multi-tab propagation, optional host permission prompts and native installed-extension motion. Web behavior and a successful extension build do not prove these.
3. Network fault acceptance: test the final error/retry UI under controlled offline/HTTP failures. Timeout/cancellation is unit-tested, but this run's actual Wikipedia network ultimately succeeded; no final network error screen was visually accepted.
4. Accessibility: screen-reader output, contrast measurements, zoom and a complete focus sweep remain. Current semantic improvements are not a compliance claim.
5. Theme quality baseline: keep the theme set stable and choose the strongest existing scenes as visual/motion benchmarks. No further scene restyling or audio added in this core pass.

Changes remain on `codex/nature-themes`. No merge, version bump, push, store submission or publication was performed.
