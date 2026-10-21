# Nature themes — first integration

## Git and release boundaries

- Stable baseline on `main`: `8444600` (`fix: prevent theme opacity reset at dissolve completion`). This saves the independently verified flash repair without creating a release tag or changing the store version.
- Feature branch: `codex/nature-themes`, created directly from that baseline.
- Review the rendered themes on this branch, then merge the feature commit into `main`. If theme design needs more iteration, the baseline fix can still be released independently.
- No remote push, version bump, store upload or publication is part of this design pass.

## Source and scope

User-owned source: https://www.magicpatterns.com/c/ckuiwzhktsyxpvxzxcva5h

Read through Magic Patterns MCP after OAuth reconnection. Source artifact: `ecb025a5-f461-482b-89d1-e84487398385`.

Five additions: Aurora, Sunrise, Stream, Zen Garden and Fireflies. Preserve reference gradients, scene geometry, preview artwork and the original timing/trajectory intent. Convert background motion to CSS so it inherits Glimmer's existing hidden-page pause and reduced-motion behavior. Keep the newly repaired native backdrop dissolve unchanged.

Intentional adaptations:

- Seed random particle and sand layouts for reproducible rendering without remount jumps.
- Use React IDs for Stream and Zen Garden SVG paint servers, including overlapping instances and thumbnails.
- Give the new Sunrise the ID `sunrise-sea`: historical `sunrise` and `dawn` remain migrated to Solar as before.
- Crossfade the Sunrise sky colors, rather than animate full-screen gradient paint on each animation frame; the sun rises once over eight seconds and stays in its final position.
- Remove Stream's straight container-edge shadow; follow the curved SVG bank instead.
- Render Zen Garden rake rings as ellipses in ground perspective.
- Bound the enlarged theme palette to the viewport, allowing vertical scrolling on short screens.

No environmental audio, new dependency, network asset, storage key, permission, data-source behavior or About copy was added/changed.

## Verification

- 58 tests passed, including shared dissolve handoff, deterministic layouts, noninteractive/offline decorative scenes, and unique SVG IDs with simultaneous duplicate scene instances.
- ESLint, extension build, web build, regression script passed.
- Real local web preview: all five scenes inspected and screenshots saved under `docs/screenshots/2026-10-20/`.
- CDP animation-frame sampling of real UI selections: 120 frames each for Aurora, Sunrise, Stream, Zen Garden and Fireflies (600 total). Every transition used two layers, had zero per-layer opacity decreases (tolerance .001), and ended with exactly one layer at opacity 1.
- Reduced-motion browser emulation: Sunrise reaches its opaque static final position immediately; Fireflies retains 22 visible, nonanimated lights. Emulation cleared afterward.
- Sunrise selection survived a real page reload.
- Narrow viewport 375 × 480: document width stayed 375; theme panel stayed inside the viewport with vertical scrolling; last theme remained selectable. Viewport override reset afterward.
- A native unpacked Chrome-extension sampling loop was also started, but the native input channel did not return its final report reliably. It is not counted as a passing result; release-specific extension acceptance remains a separate gate.

## Review guidance

Start with Aurora for the dark palette and Sunrise/Stream for daylight. Fireflies intentionally retains the reference's sparse lights across the view; judge distraction using longer reading, not only a screenshot. Keep audio for a later, separate iteration; seasonal themes were subsequently added at the user's request below.

## Follow-up: Maple and Sakura (2026-10-21)

User clarified that Maple and Sakura are favorites and that the feature must be additive. Both are now appended after the original eleven and the first five additions, for eighteen total themes. Rechecked the source artifact through Magic Patterns MCP; it is unchanged.

- Preserve source maple leaf SVG geometry, five-petal blossoms and branch artwork, colors, particle counts (26 maple leaves, 28 sakura petals), sampled analytic trajectories, depths and timings.
- Use seeded layouts and per-instance Maple SVG gradient IDs, CSS motion that shares backdrop pause, and visible static placement under reduced motion.
- Shift only the new Sakura branch below the top toolbar's brand label to prevent overlap. No original scene is restyled.
- A direct Git comparison to baseline `8444600` confirms all eleven original theme definitions are byte-for-byte retained and no preexisting scene file changed. The original data-source/collection logic is untouched; only the theme menu's viewport boundary changed in the earlier integration.
- Live web selection sampling: Maple 120 frames, Sakura 120 frames; zero layer-opacity regressions, both finish with one opaque layer.
- Browser reduced-motion emulation verified zero moving scene elements and 26/28 visible leaves/petals respectively; emulation cleared afterward.
- After the branch-position correction, final screenshots saved as `maple.jpg` and `sakura.jpg`; the preview is left on Sakura.
- 58 tests, lint, web build, extension build, regression script, and whitespace checks passed again.

These additions remain on `codex/nature-themes`; the baseline flash fix stays independently available on `main`. No merge or store submission has been performed.
