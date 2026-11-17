import { useId, type CSSProperties } from 'react'
import { sceneRandom } from './sceneGeometry'

// One moon over still water. The composition is a single vertical axis:
// the disc, its halo and its reflection share an x position, and everything
// else is left dark so the text sits in clear air.
const MOON_X = 74
const MOON_Y = 22

// Reflection strokes widen and scatter toward the viewer, like a column of
// light broken by a faint swell.
const random = sceneRandom(88)
const GLINTS = Array.from({ length: 17 }, (_, i) => {
  const depth = i / 16
  return {
    top: 70 + depth * 27,
    width: 22 + depth * 150 + random() * 26,
    drift: (random() - .5) * (6 + depth * 26),
    opacity: .5 - depth * .28 + random() * .08,
    duration: 7 + random() * 6,
    delay: -random() * 12,
  }
})

// A handful of stars at the margins only; the middle of the sky stays empty.
const STARS = Array.from({ length: 16 }, () => {
  const left = random() < .5 ? 3 + random() * 24 : 62 + random() * 35
  return { left, top: 3 + random() * 36, size: .9 + random() * 1.3, opacity: .25 + random() * .4, duration: 6 + random() * 8, delay: -random() * 10 }
})

function MoonScene() {
  const id = useId().replace(/:/g, '')
  return <>
    <div className="moon-stars">{STARS.map((s, i) => (
      <i key={i} style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, opacity: s.opacity,
        animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s` } as CSSProperties} />
    ))}</div>
    <div className="moon-halo" style={{ left: `${MOON_X}%`, top: `${MOON_Y}%` }} />
    <svg className="moon-disc" style={{ left: `${MOON_X}%`, top: `${MOON_Y}%` }} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <radialGradient id={`${id}-disc`} cx=".42" cy=".38" r=".72">
          <stop stopColor="#f6f1e2" /><stop offset=".7" stopColor="#e8e2cf" /><stop offset="1" stopColor="#d9d4c3" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id}-disc)`} />
      <g fill="#b9b49f" opacity=".16"><circle cx="36" cy="40" r="11" /><circle cx="62" cy="58" r="14" /><circle cx="55" cy="28" r="6" /></g>
    </svg>
    <div className="moon-cloud" />
    <div className="moon-water">
      <div className="moon-horizon" />
      <div className="moon-sheen" style={{ left: `${MOON_X}%` }} />
      {GLINTS.map((g, i) => (
        <i key={i} className="moon-glint" style={{ top: `${(g.top - 70) / 27 * 88}%`, left: `${MOON_X}%`, width: g.width, opacity: g.opacity,
          '--glint-drift': `${g.drift}px`, animationDuration: `${g.duration}s`, animationDelay: `${g.delay}s` } as CSSProperties} />
      ))}
    </div>
  </>
}

export function MoonTheme() {
  return <div aria-hidden className="theme-scene moon-scene"><MoonScene /></div>
}
export function MoonPreview() {
  return <div aria-hidden className="theme-scene theme-preview moon-scene"><MoonScene /></div>
}
