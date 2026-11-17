import { useId } from 'react'
import { sceneRandom } from './sceneGeometry'

// One tree outside the frame, projected onto a quiet plaster wall.
// Leaves attach to their twigs rather than floating as independent particles.
const LEAF = 'M0 0C13 -17 41 -19 58 -3C45 15 16 18 0 0Z'
const TWIGS = [
  { x: 1470, y: -30, angle: 151, length: 680, leaves: 7, scale: 1.15 },
  { x: 1520, y: 130, angle: 124, length: 600, leaves: 6, scale: .94 },
  { x: 1510, y: 590, angle: 168, length: 490, leaves: 5, scale: 1.04 },
]

function Twig({ length, leaves, scale }: { length: number; leaves: number; scale: number }) {
  const random = sceneRandom(length)
  const bend = length * .14
  return <>
    <path d={`M0 0Q${length * .45} ${-bend * 2} ${length} 0`} stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
    {Array.from({ length: leaves }, (_, i) => {
      const t = .12 + i / leaves * .83 + random() * .035
      const x = length * t
      const y = -4 * bend * t * (1 - t)
      const size = scale * (1.25 - t * .5) * (.75 + random() * .5)
      const angle = -45 + random() * 28
      const opposite = 40 + random() * 42
      return <g key={i}>
        <path d={LEAF} transform={`translate(${x} ${y}) rotate(${angle}) scale(${size * 1.45} ${size})`} />
        {i % 3 !== 1 && <path d={LEAF} transform={`translate(${x + 20 + random() * 18} ${y - 2}) rotate(${opposite}) scale(${size * 1.15} ${size * .84})`} />}
      </g>
    })}
    <path d={LEAF} transform={`translate(${length - 18} -1) rotate(14) scale(.72)`} />
  </>
}

function WindowScene() {
  const id = useId().replace(/:/g, '')
  return <>
    <div className="window-daylight" />
    <svg className="window-light" viewBox="0 0 1440 900" preserveAspectRatio="xMaxYMid slice">
      <defs>
        <filter id={`${id}-soft`} x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="5.5" /></filter>
        <filter id={`${id}-distant`} x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="11" /></filter>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="0">
          <stop offset=".35" stopColor="white" stopOpacity="0" /><stop offset=".67" stopColor="white" stopOpacity=".65" /><stop offset="1" stopColor="white" />
        </linearGradient>
        <mask id={`${id}-mask`}><rect width="1440" height="900" fill={`url(#${id}-edge)`} /></mask>
      </defs>
      <g mask={`url(#${id}-mask)`} fill="currentColor" color="#65685b">
        <g className="window-canopy" filter={`url(#${id}-soft)`} opacity=".24">
          {TWIGS.map((b, i) => <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.angle})`}>
            <g className={`window-twig window-twig-${i}`}><Twig {...b} /></g>
          </g>)}
        </g>
        <g className="window-canopy window-canopy-distant" filter={`url(#${id}-distant)`} opacity=".12" transform="translate(90 -140)">
          <g transform="translate(1460 0) rotate(155)"><Twig length={730} leaves={8} scale={1.55} /></g>
        </g>
      </g>
    </svg>
    <div className="window-reading-light" />
  </>
}

export function WindowTheme() {
  return <div aria-hidden className="theme-scene window-scene"><WindowScene /></div>
}
export function WindowPreview() {
  return <div aria-hidden className="theme-scene theme-preview window-scene"><WindowScene /></div>
}
