import { SCENE_SURFACES } from './sceneSurfaces'
// Flame and log artwork adapted from the user-owned Magic Patterns reference.
// https://www.magicpatterns.com/c/ckuiwzhktsyxpvxzxcva5h
import { useId, useMemo, type CSSProperties } from 'react'
import { sceneRandom } from './sceneGeometry'

const FLAME_PATH =
  'M20,60 C9,54 6,40 12,26 C14,33 18,29 16,18 C24,24 28,12 23,3 C34,13 38,31 30,43 C34,40 35,47 31,53 C28,58 24,60 20,60 Z'

function Flame({
  scale,
  id,
  colors,
  delay,
  dur,
  opacity = 1,
}: {
  scale: number
  id: string
  colors: [string, string]
  delay: number
  dur: number
  opacity?: number
}) {
  return (
    <svg
      width={42 * scale}
      height={64 * scale}
      viewBox="0 0 40 62"
      className="campfire-flame absolute bottom-0 left-1/2"
      style={{
        marginLeft: -21 * scale,
        transformOrigin: 'bottom center',
        overflow: 'visible',
        opacity,
        animationDuration: `${dur}s`,
        animationDelay: `${-delay}s`,
        willChange: 'transform',
      }}
    >
      <defs>
        <linearGradient id={id} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="72%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[1]} stopOpacity={0.15} />
        </linearGradient>
      </defs>
      <path d={FLAME_PATH} fill={`url(#${id})`} />
    </svg>
  )
}

function FireBase() {
  const stones = [
    { x: -54, y: 6, rx: 17, ry: 7, r: -8 },
    { x: -26, y: 11, rx: 16, ry: 7, r: 4 },
    { x: 3, y: 12, rx: 17, ry: 7, r: -2 },
    { x: 32, y: 9, rx: 16, ry: 7, r: 7 },
    { x: 53, y: 3, rx: 14, ry: 6, r: -5 },
  ]
  return (
    <svg
      width={150}
      height={48}
      viewBox="-75 -24 150 48"
      className="absolute bottom-[-12px] left-1/2"
      style={{ marginLeft: -75, overflow: 'visible' }}
    >
      <ellipse cx="0" cy="14" rx="66" ry="10" fill="rgba(0,0,0,0.32)" />
      {stones.map((stone, index) => (
        <ellipse
          key={index}
          cx={stone.x}
          cy={stone.y}
          rx={stone.rx}
          ry={stone.ry}
          fill={index % 2 ? '#343332' : '#41403d'}
          stroke="rgba(170,148,122,0.16)"
          strokeWidth={1}
          transform={`rotate(${stone.r} ${stone.x} ${stone.y})`}
        />
      ))}
      <g transform="rotate(-12)">
        <rect x="-44" y="-9" width="88" height="14" rx="7" fill="#342117" />
        <rect x="-35" y="-7" width="54" height="2" rx="1" fill="rgba(145,89,48,0.38)" />
        <circle cx="42" cy="-2" r="6" fill="#1f1712" stroke="#704025" strokeWidth={2} />
      </g>
      <g transform="rotate(13)">
        <rect x="-44" y="-9" width="88" height="14" rx="7" fill="#45291b" />
        <rect x="-31" y="-7" width="46" height="2" rx="1" fill="rgba(170,101,50,0.34)" />
        <circle cx="42" cy="-2" r="6" fill="#241812" stroke="#7b4527" strokeWidth={2} />
      </g>
      <ellipse cx="0" cy="-2" rx="31" ry="8" fill="rgba(228,84,27,0.22)" />
    </svg>
  )
}


function CampfireArt() {
  const id = useId()
  return <div className="campfire-art">
    <FireBase />
    <Flame scale={1.75} id={`${id}-outer`} colors={['#e87234', '#b84929']} delay={0} dur={2.7} opacity={0.82} />
    <Flame scale={1.3} id={`${id}-middle`} colors={['#ffc474', '#ef863e']} delay={0.7} dur={2.2} />
    <Flame scale={0.72} id={`${id}-core`} colors={['#fff2c6', '#ffc56a']} delay={1.2} dur={1.9} />
  </div>
}

export function CampfireTheme() {
  const embers = useMemo(() => {
    const random = sceneRandom(718)
    return Array.from({length: 8}, () => ({
      x: -22 + random() * 44,
      drift: -24 + random() * 48,
      rise: 70 + random() * 85,
      size: 1 + random() * 1.4,
      duration: 5 + random() * 4,
      delay: -random() * 9,
    }))
  }, [])
  return <div aria-hidden className="theme-scene campfire-scene" style={{ background: SCENE_SURFACES.campfire }}>
    <div className="campfire-distant-light" />
    <div className="campfire-ground" />
    <div className="campfire-light-pool" />
    <div className="campfire-location">
      <CampfireArt />
      {embers.map((ember,i) => <i key={i} className="campfire-ember" style={{
        left: `${ember.x}px`, width:ember.size, height:ember.size,
        '--ember-drift':`${ember.drift}px`, '--ember-rise':`${-ember.rise}px`,
        animationDuration:`${ember.duration}s`, animationDelay:`${ember.delay}s`,
      } as CSSProperties} />)}
    </div>
  </div>
}

export function CampfirePreview() {
  return <div aria-hidden className="theme-scene theme-preview campfire-scene campfire-preview" style={{ background: SCENE_SURFACES.campfire }}>
    <div className="campfire-ground" /><div className="campfire-light-pool" />
    <div className="campfire-location"><CampfireArt /></div>
  </div>
}
