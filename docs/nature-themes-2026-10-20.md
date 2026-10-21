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


## Quality curation and polish (2026-10-21)

Following the full-theme visual review, the user approved removing Sunrise, Stream and Zen Garden. Their selectors, random-theme entries, components and unused scene styles are removed. Fifteen themes remain: the original eleven plus Aurora, Fireflies, Maple and Sakura. Earlier counts and screenshots above document historical iterations.

- Maple: replace overlapping smooth lobes with a continuous serrated palm-shaped leaf outline; mute copper/ochre tones; reduce leaves from 26 to 16, lengthen falls to 23–42 seconds, distribute them along the sides, and remove floating glitter.
- Sakura: reduce petals from 28 to 16, lengthen falls to 15–29 seconds, and preserve the blossom branch.
- Fireflies: reduce lights from 22 to 14; keep them in the lower meadow, slow their movement, soften their pulse and glow, and reduce the upper-right glow. Update the thumbnail accordingly.
- Apply a soft elliptical mask only to the three new particle scenes, protecting the central reading area without a hard rectangular boundary.
- Original eleven scene files and the independently committed backdrop handoff fix remain unchanged. No source, collection, permission or storage behavior is changed.

Verification: 58 tests, ESLint, extension build, web build, regression checks and whitespace checks passed. Real web selections confirmed the 15-item theme list and the final Maple/Sakura/Fireflies renders. Final screenshots are in `docs/screenshots/2026-10-21/`. This is a design branch preview; no store submission or release acceptance is claimed.

## Motion and water-light refinement (2026-10-21)

User requested more visible side-to-side maple falling, more Sakura petals with the existing central clearing, and a quality pass on After Rain and Ripples. This explicitly extends the previous preservation scope to these two original themes; the other nine original scenes remain untouched.

- Maple retains its leaf artwork, count, palette and vertical speed, but now completes 2.6–3.4 lateral cycles per fall, with 62–96px near-layer sway and a larger correlated tilt. Increase trajectory samples from 20 to 60 so turnarounds remain smooth.
- Sakura increases from 16 to 24 petals, retaining the same center mask and trajectories.
- After Rain replaces the vague two-ribbon refraction with a soft spectral arc on the right, cooler shaded sky and warm upper-right daylight. The central reading haze and existing persisted rainbow ID remain.
- Ripples uses elliptical perspective, directionally lit ring edges, a slightly deeper water palette, and a decelerating expansion with gradual decay. Pool and particle counts remain bounded.
- Follow-up assessment: Solar is the next candidate for improvement because its broad violet/orange gradient is visually generic and relatively saturated. No changes to Solar were made in this pass.

Verification: 58 tests, ESLint, both builds, regression script and whitespace check passed. Live Maple sampling over 360 animation frames (~6 seconds) found horizontal direction reversals in all 16 leaves, with near-layer horizontal spans 138–159px. Real selection and screenshots verified all four scenes; reduced-motion emulation found zero animated scene descendants in each, and the emulation was cleared. Screenshots are under `docs/screenshots/2026-10-21/refinement/`. Local preview server restarted at port 5001 after discovering that the earlier tab had retained an old page while the server was stopped. These remain design-branch changes, not a release.

## User correction: softer leaves, cleaner rainbow, overhead water (2026-10-21)

User rejected the serrated leaf as too sharp, reported uneven motion, found the rainbow muddy, and clarified that Ripples must be viewed directly from above. This supersedes the previous visual direction for those details.

- Restore the source's curved maple lobes. Separate constant vertical descent on the outer track from a compositor-transform lateral pendulum on an inner element, using eased alternating turns instead of a single sampled transform path. Retain the central clearing and 16-leaf count. Do not attribute all perceived stutter to one unmeasured cause: the new implementation removes the sampled velocity joints and reduces motion complexity.
- After Rain now uses a neutral white/blue sky, narrower pastel spectrum, less blur and no yellow/green base or muddy overlapping haze.
- Ripples returns to circular expansion with no rotation or oblique perspective; gentle edge illumination and decay remain.
- Sakura remains at 24 petals, unchanged in this correction.

Verification: 240 live animation frames had zero frame gaps above 34ms; maximum per-frame horizontal displacement was 0.880px, maximum change of that displacement was 0.083px. This is local web evidence, not a universal device-performance guarantee. Reduced-motion Maple retained 16 leaves with zero animated descendants; emulation cleared. Real screenshots of all three corrected scenes saved under `docs/screenshots/2026-10-21/correction/`. 58 tests, lint, both builds, regression script and whitespace checks passed.
