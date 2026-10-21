// Visual geometry and trajectories adapted from the user-owned Magic Patterns design.
// Source: https://www.magicpatterns.com/c/ckuiwzhktsyxpvxzxcva5h
import { useId, useMemo, type CSSProperties } from 'react'
import { sceneRandom } from './sceneGeometry'

const LEAF_TONES: [string, string][] = [
  ['#c98654', '#955032'],
  ['#c6a15f', '#96703d'],
  ['#bd7046', '#8b4531'],
  ['#c58d51', '#94623a'],
]

// A continuous, serrated palm-shaped outline keeps the five lobes legible at small sizes.
const MAPLE_OUTLINE = 'M0 -39 L6 -25 L11 -28 L10 -13 L23 -25 L23 -17 L34 -19 L28 -7 L34 -5 L16 8 L20 15 L4 12 L2 25 L-2 25 L-4 12 L-20 15 L-16 8 L-34 -5 L-28 -7 L-34 -19 L-23 -17 L-23 -25 L-10 -13 L-11 -28 L-6 -25 Z'

function MapleLeaf({
  size,
  tone,
  id,
}: {
  size: number
  tone: number
  id: string
}) {
  const [light, deep] = LEAF_TONES[tone % LEAF_TONES.length]
  return (
    <svg
      width={size}
      height={size}
      viewBox="-38 -8 76 78"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={id} x1="20%" y1="0%" x2="75%" y2="100%">
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor={deep} />
        </linearGradient>
      </defs>
      <g transform="translate(0 34)">
        <path d={MAPLE_OUTLINE} fill={`url(#${id})`} stroke={deep} strokeWidth={0.45} strokeLinejoin="round" />
        <path d="M0 22 L0 -30 M0 9 L-23 -12 M0 9 L23 -12 M0 9 L-14 11 M0 9 L14 11" fill="none" stroke={deep} strokeWidth={0.65} opacity={0.32} />
      </g>
    </svg>
  )
}

interface FallTrajectory {
  x: number[]
  y: string[]
  rotate: number[]
  times: number[]
}

interface Leaf {
  left: number
  size: number
  dur: number
  delay: number
  tone: number
  blur: number
  trajectory: FallTrajectory
}

/**
 * 从同一个解析曲线采样位置与姿态：枫叶只进行一次左右摆振，持续向下，
 * 姿态角与横向速度同步；不使用侧翻缩放，叶面始终正对观看者。
 */
function makeLeafTrajectory(near: boolean, random: () => number): FallTrajectory {
  const steps = 20
  const times = Array.from({ length: steps + 1 }, (_, index) => index / steps)
  const phase = random() * Math.PI * 2
  const cycles = 0.72 + random() * 0.34
  const sway = (near ? 26 : 15) + random() * (near ? 24 : 15)
  const drift = -18 + random() * 36
  const bob = 1.4 + random() * 1.5
  const baseAngle = -10 + random() * 20
  const tilt = 10 + random() * 8
  const initialWave = Math.sin(phase)
  const initialSecondary = Math.sin(phase * 0.7)

  const x = times.map((time) => {
    const wave = Math.sin(phase + Math.PI * 2 * cycles * time) - initialWave
    const secondary =
      Math.sin(phase * 0.7 + Math.PI * 4 * cycles * time) - initialSecondary
    return sway * (wave + secondary * 0.12) + drift * time
  })

  const y = times.map((time) => {
    const verticalFlutter =
      Math.sin(phase + Math.PI * 2 * cycles * time) - initialWave
    return `${-12 + 126 * time + bob * verticalFlutter}vh`
  })

  const rotate = times.map(
    (time) =>
      baseAngle +
      tilt * Math.cos(phase + Math.PI * 2 * cycles * time) +
      2.4 * Math.sin(phase + Math.PI * 4 * cycles * time),
  )

  return { x, y, rotate, times }
}

function makeLeaves(count: number, near: boolean): Leaf[] {
  const random = sceneRandom(near ? 1941 : 1942)
  return Array.from({ length: count }).map(() => {
    const dur = near ? 23 + random() * 9 : 30 + random() * 12
    return {
      left: random() < 0.5 ? 2 + random() * 23 : 75 + random() * 23,
      size: near ? 38 + random() * 20 : 18 + random() * 12,
      dur,
      delay: -random() * dur,
      tone: Math.floor(random() * LEAF_TONES.length),
      blur: near ? 0 : 0.8,
      trajectory: makeLeafTrajectory(near, random),
    }
  })
}

/** 秋枫 —— 每片叶沿独立、连续的空气动力学轨迹稳定下沉，正面叶身只作缓慢摆振。 */
export function MapleTheme() {
  const leafId = useId()
  const far = useMemo(() => makeLeaves(8, false), [])
  const near = useMemo(() => makeLeaves(8, true), [])
  const all = [...far, ...near]
  return (
    <div
      aria-hidden
      className="theme-scene maple-scene"
      style={{
        background:
          'linear-gradient(180deg, #f2e4d8 0%, #ede0cc 55%, #e6d0ac 100%)',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, rgba(255,245,225,0.55) 0%, rgba(255,245,225,0) 62%)',
        }}
      />

      <div className="reading-safe-particles">
        {all.map((l, i) => (
          <div
            key={i}
            className="maple-leaf absolute"
            style={{
              left: `${l.left}%`,
              animationDuration: `${l.dur}s`,
              animationDelay: `${l.delay}s`,
              '--fall-still-y': `${12 + (i / all.length) * 82}vh`,
              ...Object.fromEntries(l.trajectory.times.flatMap((_, step) => [
                [`--fall-x${step}`, `${l.trajectory.x[step]}px`],
                [`--fall-y${step}`, l.trajectory.y[step]],
                [`--fall-r${step}`, `${l.trajectory.rotate[step]}deg`],
              ])),
              top: -l.size - 10,
              willChange: 'transform',
              filter: l.blur ? `blur(${l.blur}px)` : undefined,
            } as CSSProperties}

          >
            <MapleLeaf size={l.size} tone={l.tone} id={`${leafId}-${i}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MaplePreview() {
  const leafId = useId()
  return (
    <div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(180deg, #f2e4d8 0%, #e6d0ac 100%)',
      }}
    >
      {[
        { l: 20, t: 22, s: 18, r: 10, tone: 0 },
        { l: 50, t: 44, s: 15, r: 60, tone: 1 },
        { l: 72, t: 20, s: 17, r: -20, tone: 2 },
        { l: 36, t: 62, s: 15, r: 40, tone: 3 },
        { l: 84, t: 55, s: 17, r: -50, tone: 0 },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: `${p.l}%`, top: `${p.t}%`, transform: `rotate(${p.r}deg)` }}
        >
          <MapleLeaf size={p.s} tone={p.tone} id={`${leafId}-${i}`} />
        </div>
      ))}
    </div>
  )
}

