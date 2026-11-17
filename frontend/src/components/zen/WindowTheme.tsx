import { useId } from 'react'
import { sceneRandom } from './sceneGeometry'

// Window light on a plaster wall: a pane grid of sun, softer the further it
// travels, with a branch outside the glass moving the shadows very slightly.
// Nothing is drawn but light and shadow, so the wall stays a quiet reading
// surface and the page feels like a room, not an illustration.
const PANE = { w: 214, h: 236, gap: 26 }
const COLS = 2
const ROWS = 3

function PaneGrid({ fill }: { fill: string }) {
  const rects = []
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    rects.push(<rect key={`${r}-${c}`} x={c * (PANE.w + PANE.gap)} y={r * (PANE.h + PANE.gap)} width={PANE.w} height={PANE.h} rx="2" fill={fill} />)
  }
  return <>{rects}</>
}

// A leaf-bearing twig, laid out once from a fixed seed so every mount matches.
const random = sceneRandom(2211)
const LEAVES = Array.from({ length: 26 }, (_, i) => {
  const t = i / 25
  return {
    x: -40 + t * 520 + (random() - .5) * 46,
    y: 210 - Math.sin(t * 2.4) * 120 + (random() - .5) * 90,
    rotate: -70 + random() * 140,
    scale: .75 + random() * .7,
  }
})
const LEAF = 'M0 0C16 -22 46 -24 64 0C46 22 16 22 0 0Z'

function Shadows() {
  return <g>
    <g className="window-twig" style={{ transformOrigin: '0px 210px' }}>
      <path d="M-60 240C90 190 190 120 330 150C400 165 440 110 520 70" stroke="#6f7662" strokeWidth="5" fill="none" strokeLinecap="round" />
      {LEAVES.map((leaf, i) => <path key={i} d={LEAF} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate}) scale(${leaf.scale})`} fill="#6f7662" />)}
    </g>
  </g>
}

function WindowScene() {
  const id = useId().replace(/:/g, '')
  const lightTransform = 'translate(868 -70) skewX(-13) rotate(5)'
  return <>
    <svg className="window-light" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="46" /></filter>
        <filter id={`${id}-edge`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.2" /></filter>
        <filter id={`${id}-twig`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" /></filter>
        <linearGradient id={`${id}-fade`} x1="1" y1="0" x2="0" y2="1">
          <stop stopColor="#fff" /><stop offset=".62" stopColor="#fff" stopOpacity=".75" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-fade-mask`}><rect width="1440" height="900" fill={`url(#${id}-fade)`} /></mask>
        <mask id={`${id}-twig-mask`}>
          <g transform={lightTransform}><PaneGrid fill="#fff" /></g>
        </mask>
      </defs>
      <g mask={`url(#${id}-fade-mask)`}>
        <g className="window-sun">
          <g transform={lightTransform} filter={`url(#${id}-soft)`} opacity=".7"><PaneGrid fill="#fff3d6" /></g>
          <g transform={lightTransform} filter={`url(#${id}-edge)`} opacity=".92"><PaneGrid fill="#fff8e8" /></g>
        </g>
        <g mask={`url(#${id}-twig-mask)`}><g transform="translate(940 -30)" filter={`url(#${id}-twig)`} opacity=".2"><Shadows /></g></g>
      </g>
    </svg>
  </>
}

export function WindowTheme() {
  return <div aria-hidden className="theme-scene window-scene"><WindowScene /><div className="window-wall-light" /></div>
}
export function WindowPreview() {
  return <div aria-hidden className="theme-scene theme-preview window-scene"><WindowScene /><div className="window-wall-light" /></div>
}
