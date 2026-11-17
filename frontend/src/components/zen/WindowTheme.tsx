import { useId } from 'react'
import { sceneRandom } from './sceneGeometry'

// Dappled light on a warm plaster wall. No window, no panes: only soft blobs
// of sun where it passes between leaves, and blurred leaf shadows around them,
// the way late sun lands on a wall from a tree you cannot see. The shadows
// drift very slowly, as if a breeze moves the branch. Nothing else moves, and
// everything thins out toward the reading column.
const LEAF = 'M0 0C16 -22 46 -24 64 0C46 22 16 22 0 0Z'

type Branch = { from: [number, number]; to: [number, number]; bend: number; leaves: number; size: [number, number]; seed: number }

// Branches enter from the upper right and reach into the wall. Each is laid
// out once from a fixed seed so every mount matches.
const BRANCHES: Branch[] = [
  { from: [1560, -40], to: [980, 250], bend: -90, leaves: 20, size: [1.3, 2.1], seed: 2211 },
  { from: [1560, 330], to: [1110, 470], bend: 60, leaves: 14, size: [1.1, 1.8], seed: 5303 },
  { from: [1230, -60], to: [820, 90], bend: 40, leaves: 11, size: [1, 1.6], seed: 8141 },
  { from: [1560, 720], to: [690, 470], bend: -70, leaves: 8, size: [1, 1.5], seed: 3917 },
]

function layoutBranch(b: Branch) {
  const random = sceneRandom(b.seed)
  const [x0, y0] = b.from
  const [x1, y1] = b.to
  const cx = (x0 + x1) / 2 + b.bend * .4
  const cy = (y0 + y1) / 2 + b.bend
  const point = (t: number) => ({
    x: (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1,
    y: (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1,
  })
  const leaves = Array.from({ length: b.leaves }, (_, i) => {
    const t = .12 + (i / (b.leaves - 1)) * .88
    const p = point(t)
    return {
      x: p.x + (random() - .5) * 150,
      y: p.y + (random() - .5) * 170,
      rotate: random() * 360,
      scale: b.size[0] + random() * (b.size[1] - b.size[0]),
    }
  })
  return { path: `M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}`, leaves }
}
const LAID = BRANCHES.map(layoutBranch)

// Sun blobs: x, y, rx, ry, opacity. Wide and soft, overlapping into one
// another so the light reads as a pool broken by shade, not as spots.
const GLOW: Array<[number, number, number, number, number]> = [
  [1240, 90, 330, 230, .62],
  [880, 250, 250, 170, .5],
  [1180, 470, 260, 170, .46],
  [640, 150, 190, 130, .36],
  [760, 520, 200, 130, .3],
]
const DAPPLE: Array<[number, number, number, number, number]> = [
  [1190, 120, 118, 82, .85],
  [960, 235, 96, 68, .78],
  [1280, 330, 104, 72, .72],
  [790, 170, 78, 56, .62],
  [1075, 430, 92, 64, .66],
  [640, 330, 66, 48, .46],
  [900, 500, 70, 50, .44],
  [1330, 560, 88, 60, .5],
]
const CORE: Array<[number, number, number, number, number]> = [
  [1170, 125, 54, 38, .9],
  [950, 240, 44, 32, .8],
  [1270, 335, 46, 32, .76],
  [1070, 435, 40, 28, .7],
]

function WindowScene() {
  const id = useId().replace(/:/g, '')
  return <svg className="window-light" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
    <defs>
      <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70" /></filter>
      <filter id={`${id}-dapple`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="34" /></filter>
      <filter id={`${id}-core`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20" /></filter>
      <filter id={`${id}-near`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="17" /></filter>
      <filter id={`${id}-far`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8" /></filter>
      <radialGradient id={`${id}-fade`} cx="1" cy=".05" r="1.2">
        <stop stopColor="#fff" /><stop offset=".55" stopColor="#fff" stopOpacity=".8" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <mask id={`${id}-mask`}><rect width="1440" height="900" fill={`url(#${id}-fade)`} /></mask>
    </defs>
    <g mask={`url(#${id}-mask)`}>
      <g filter={`url(#${id}-glow)`}>
        {GLOW.map(([cx, cy, rx, ry, o], i) => <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#f2c987" opacity={o * .85} />)}
      </g>
      <g filter={`url(#${id}-dapple)`}>
        {DAPPLE.map(([cx, cy, rx, ry, o], i) => <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff1cf" opacity={o} transform={`rotate(${-20 - (i % 3) * 9} ${cx} ${cy})`} />)}
      </g>
      <g filter={`url(#${id}-core)`}>
        {CORE.map(([cx, cy, rx, ry, o], i) => <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#fffaf0" opacity={o} transform={`rotate(-26 ${cx} ${cy})`} />)}
      </g>
      <g className="window-leaves">
        <g filter={`url(#${id}-near)`} opacity=".25">
          {LAID.map((b, bi) => <g key={bi}>
            <path d={b.path} stroke="#5f6755" strokeWidth="9" fill="none" strokeLinecap="round" />
            {b.leaves.map((l, i) => <path key={i} d={LEAF} transform={`translate(${l.x} ${l.y}) rotate(${l.rotate}) scale(${l.scale * 1.15})`} fill="#5f6755" />)}
          </g>)}
        </g>
        <g filter={`url(#${id}-far)`} opacity=".11" transform="translate(-70 60) scale(.96)">
          {LAID.map((b, bi) => <g key={bi}>
            {b.leaves.map((l, i) => <path key={i} d={LEAF} transform={`translate(${l.x + 40} ${l.y - 30}) rotate(${l.rotate + 70}) scale(${l.scale * .7})`} fill="#5f6755" />)}
          </g>)}
        </g>
      </g>
    </g>
  </svg>
}

export function WindowTheme() {
  return <div aria-hidden className="theme-scene window-scene"><WindowScene /></div>
}
export function WindowPreview() {
  return <div aria-hidden className="theme-scene theme-preview window-scene"><WindowScene /></div>
}
