import { useId } from 'react'
import { sceneRandom } from './sceneGeometry'

// Window light on a plaster wall: a pane grid of sun, softer the further it
// travels, with foliage between the sun and the glass breaking part of the
// light into dapples, the way late sun falls through leaves onto a grey wall.
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

// Dappled sun: soft blobs where light passes between leaves, strung along the
// same diagonal as the pane light, fading as it travels down the wall.
const DAPPLES: Array<[number, number, number, number, number]> = [
  [1185, 105, 150, 108, .6],
  [950, 220, 118, 88, .56],
  [700, 150, 96, 74, .5],
  [1245, 345, 122, 92, .5],
  [830, 400, 98, 76, .52],
  [470, 330, 84, 64, .4],
  [1060, 545, 104, 80, .42],
  [610, 590, 82, 62, .34],
]
const DAPPLE_CORES: Array<[number, number, number, number, number]> = [
  [1150, 125, 58, 43, .6],
  [945, 230, 48, 36, .54],
  [815, 405, 40, 30, .48],
]

// Foliage shadows: a few clusters of leaves seen only as shade on the wall,
// densest near the light source, barely there by the reading column.
const FOLIAGE_CLUSTERS = [
  { cx: 1300, cy: 30, spread: 120, count: 9, opacity: .1 },
  { cx: 1090, cy: 290, spread: 100, count: 7, opacity: .085 },
  { cx: 700, cy: 480, spread: 90, count: 6, opacity: .075 },
]
const foliageRandom = sceneRandom(9377)
const FOLIAGE = FOLIAGE_CLUSTERS.flatMap((cluster) =>
  Array.from({ length: cluster.count }, () => ({
    x: cluster.cx + (foliageRandom() - .5) * 2 * cluster.spread,
    y: cluster.cy + (foliageRandom() - .5) * 2 * cluster.spread * .8,
    rotate: foliageRandom() * 360,
    scale: .8 + foliageRandom() * 1.1,
    opacity: cluster.opacity,
  })))

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
        <filter id={`${id}-edge`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id={`${id}-twig`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" /></filter>
        <filter id={`${id}-dapple`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="24" /></filter>
        <filter id={`${id}-dapple-core`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="12" /></filter>
        <filter id={`${id}-foliage`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="15" /></filter>
        <linearGradient id={`${id}-fade`} x1="1" y1="0" x2="0" y2="1">
          <stop stopColor="#fff" /><stop offset=".62" stopColor="#fff" stopOpacity=".75" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-fade-mask`}><rect width="1440" height="900" fill={`url(#${id}-fade)`} /></mask>
        <mask id={`${id}-twig-mask`}>
          <g transform={lightTransform}><PaneGrid fill="#fff" /></g>
        </mask>
      </defs>
      <g mask={`url(#${id}-fade-mask)`}>
        <g className="window-dapple" filter={`url(#${id}-dapple)`}>
          {DAPPLES.map(([cx, cy, rx, ry, opacity], i) => <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff6e0" opacity={opacity} transform={`rotate(${-14 - (i % 4) * 7} ${cx} ${cy})`} />)}
        </g>
        <g filter={`url(#${id}-dapple-core)`}>
          {DAPPLE_CORES.map(([cx, cy, rx, ry, opacity], i) => <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#fffaf0" opacity={opacity} transform={`rotate(-24 ${cx} ${cy})`} />)}
        </g>
        <g className="window-foliage" filter={`url(#${id}-foliage)`}>
          {FOLIAGE.map((leaf, i) => <path key={i} d={LEAF} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate}) scale(${leaf.scale})`} fill="#79806e" opacity={leaf.opacity} />)}
        </g>
        <g className="window-sun">
          <g transform={lightTransform} filter={`url(#${id}-soft)`} opacity=".62"><PaneGrid fill="#fff3d6" /></g>
          <g transform={lightTransform} filter={`url(#${id}-edge)`} opacity=".72"><PaneGrid fill="#fff8e8" /></g>
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
