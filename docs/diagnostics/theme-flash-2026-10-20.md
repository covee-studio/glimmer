# 2.2.2 theme flash diagnosis and local repair

## Verified environment

Chrome's default new-tab was initially served by unpacked extension `likeldlafpbeoddjcpmkmncadnmbkeai`, version 2.2.2. The store extension `lnoknbamomadbldpkjkbaibinkaibenk` is also enabled and shows 2.2.2 from Chrome Web Store. Diagnosis then explicitly navigated to the store extension's own `newtab.html`; console runtime manifest and ID confirmed the store environment. Duplicate installation is not sufficient to explain the defect: the defect was measured in the store extension directly.

## Reproduced symptom

Temporary requestAnimationFrame sampling (in page memory only; no source or build changes) captured computed opacity for `.theme-backdrop > div`.

Store Waves → Stars, times relative to first incoming layer:

| ms | outgoing opacity | incoming opacity |
| --- | --- | --- |
| 711 | 1 | .995 |
| 729 | 1 | .997 |
| 746 | 1 | .999 |
| 762 | 1 | 1 |
| 779 | 1 | 1 |
| 797 | 1 | 0 |
| 810 | removed | 1 |
| 827 | removed | 1 |

Independent store Stars → Waves run (120 samples): incoming opacity again fell from >.99 to 0 at 800 ms while both layers remained; final state at 1982 ms was one opaque layer. Thus the approximately 800 ms completion boundary, not fade duration/smoothness, contains a one-frame computed-style regression. This exposes the opaque outgoing scene before the incoming scene becomes opaque again.

These two live runs establish a reproducible opacity discontinuity in both directions. A separate light-to-light probe was attempted but did not execute reliably through the native UI and is not claimed as verified.

## Mechanism

`ThemeBackdrop` in `frontend/src/components/ZenMode.tsx` uses `initial={{opacity:0}}`, `animate={{opacity:1}}`, duration .8 s, and removes outgoing layers from `onAnimationComplete`.

Installed local dependency versions: motion 11.18.2 / framer-motion 11.18.2. In `framer-motion/dist/es/animation/animators/AcceleratedAnimation.mjs`, the native animation `onfinish` updates the MotionValue, calls completion, then cancels the WAAPI animation. In `render/VisualElement.mjs`, the MotionValue render request is scheduled via `frame.render`, rather than synchronously writing the DOM style. The browser animation supplies the visible opacity while active (`fill: both` in the WAAPI adapter). The observed zero-opacity frame at completion is consistent with removing that animation's override before the underlying initial opacity has been replaced by the final style. The exact cancel-to-DOM-style ordering is supported by dependency source and live computed opacity; a browser breakpoint at this handoff would provide further confirmation of the library-specific attribution.

The outgoing layer being opaque does not prevent this: it makes that old scene visible when the incoming layer briefly reverts to zero.

## Secondary issue

Dark/light foreground styling is not fully synchronized with the background dissolve. Some foreground elements have a different transition duration or switch dark classes immediately. The short Paper → Stars filmstrip showed temporarily reduced contrast. This is distinct from the measured 800 ms opacity reset.

## Prior verification gap

The release screenshots sampled roughly every 80–100 ms and only the later part of the transition; the measured erroneous frame here spans about 13 ms (797–810 ms). Such sampling can skip the exact defect even if surrounding images look monotonic. Existing 53 tests do not assert native browser animation handoff correctness. The previous claim that no sampled rebound meant ready-to-release was not adequate evidence of a flash-free transition.

## Diagnostic artifacts

- `/Users/charles/Downloads/Trace-20261020T205626.json.gz`: 16.68 s recording, screenshots limited to the first ~7.44 s; does NOT cover its late theme selection and must not be cited as proof of correct switching.
- `/Users/charles/Downloads/Trace-20261020T210358.json.gz`: ~2.17 s Paper → Stars recording with 130 screenshots. Its completion coverage is narrow; the live store DOM sampling above is the stronger evidence for the one-frame opacity regression.
- `/tmp/glimmer-analyze-trace.mjs`: local trace screenshot extractor, no product code change.

## Repair criterion for a later authorized implementation

The final opaque DOM style must remain effective when the native animation is released and the old scene removed. Validate each animation frame across completion, including light/light, light/dark, reverse, rapid switching and reduced motion. Avoid treating longer durations, later screenshots, or merely keeping the old layer as a root fix.

The initial diagnosis changed no product source, dependencies, build artifacts, or store submission. The authorized repair below was implemented afterward.


## Authorized repair and verification

Replaced only the backdrop opacity animator with a native Web Animations dissolve. The underlying DOM opacity is always 1. The native effect supplies the 0 → 1 fade, and completion synchronously writes the final opacity before canceling the effect and pruning outgoing layers. Other Motion animations remain unchanged. Unique layer keys preserve overlapping and reverse selections; disposal prevents stale completion callbacks. Reduced motion bypasses the fade.

Local unpacked extension `likeldlafpbeoddjcpmkmncadnmbkeai` loaded the rebuilt implementation (runtime ID and inline base opacity 1 confirmed). The store installation was not updated.

Live Stars → Waves rAF sampling: 120 frames, no opacity reset. Completion samples (ms, incoming opacity): 734/.993844, 749/.996144, 766/.997864, 782/.999069, 799/.999770, 815/1, 833/1, 848/1 with outgoing layer removed. At 1982 ms one opaque layer remained.

An automated UI-selection loop exercised Stars, Paper, Ripples, Mist, Solar, Mountains, Bamboo, Ocean, After rain, Snow and Waves. Every selection produced multiple backdrop layers during its dissolve and ended with one opaque layer. Total 1,034 animation-frame samples; no per-layer opacity decreases detected (tolerance .001).

Rapid Stars → Waves → Stars selections while fades overlapped: 168 frames, up to four simultaneous layers, zero per-layer opacity decreases, final one layer at opacity 1. This directly checks overlapping completion callbacks and reverse selection without key reuse.

Four targeted unit tests cover opaque handoff before cancellation/pruning, disposal racing completion, cancellation rejection, and immediate reduced-motion completion. Total 57 tests passed; lint, extension build, web build, regression checks and diff whitespace check passed. Reduced motion was unit tested, not separately emulated in the live browser.

Scope: this repairs the measured opacity reset at animation completion. Foreground/background contrast timing noted above remains a separate visual refinement; no claim is made that every aspect of theme motion has been exhaustively audited. No version bump, package upload or store submission was performed.
