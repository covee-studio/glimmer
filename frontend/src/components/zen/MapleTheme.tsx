// Visual geometry and trajectories adapted from the user-owned Magic Patterns design.
// Source: https://www.magicpatterns.com/c/ckuiwzhktsyxpvxzxcva5h
import { useId, useMemo, type CSSProperties } from 'react'
import { sceneRandom } from './sceneGeometry'

const LEAF_TONES: [string, string][] = [
  ['#f2894a', '#c1401e'],
  ['#f0a34a', '#b8621f'],
  ['#e2703a', '#a13818'],
  ['#eb8f3a', '#a85f1c'],
]

/**
 * 一片枫叶裂片：宽阔的曲线叶面向外收成清晰尖端，两侧带自然内凹；
 * 用曲线塑造饱满裂片，而不是用直线连接尖点与凹点形成五角星。
 */
function lobePath(len: number, width: number) {
  return `M0,0 C${-width * 0.55},${-len * 0.18} ${-width * 0.7},${-len * 0.55} ${-width * 0.22},${-len * 0.82} C${-width * 0.08},${-len * 0.94} 0,${-len} 0,${-len} C0,${-len} ${width * 0.08},${-len * 0.94} ${width * 0.22},${-len * 0.82} C${width * 0.7},${-len * 0.55} ${width * 0.55},${-len * 0.18} 0,0 Z`
}

const MAIN_LOBE = lobePath(39, 30)
const SIDE_LOBE = lobePath(34, 25)
const BASE_LOBE = lobePath(21, 17)

/**
 * 完整枫叶：五片宽阔的尖裂片以基部为圆心呈扇形排列。中央裂片只略长于两侧，
 * 叶面宽而饱满，不再呈细长放射状；底部两片小裂片外撇，补足真实掌状轮廓。
 */
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
      viewBox="-50 -50 100 100"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={id} x1="20%" y1="0%" x2="75%" y2="100%">
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor={deep} />
        </linearGradient>
      </defs>
      <g transform="translate(0 38)">
        <line x1="0" y1="0" x2="0" y2="12" stroke={deep} strokeWidth={2.2} strokeLinecap="round" />
        {/* 两片外撇的基部小裂片，向下向外斜张，贴近真实枫叶根部的形态 */}
        <path d={BASE_LOBE} fill={`url(#${id})`} transform="rotate(-112)" opacity={0.96} />
        <path d={BASE_LOBE} fill={`url(#${id})`} transform="rotate(112)" opacity={0.96} />
        {/* 两片宽阔侧裂片，让整体轮廓更接近真实枫叶 */}
        <path d={SIDE_LOBE} fill={`url(#${id})`} transform="rotate(-44)" />
        <path d={SIDE_LOBE} fill={`url(#${id})`} transform="rotate(44)" />
        {/* 中央最长裂片 */}
        <path d={MAIN_LOBE} fill={`url(#${id})`} />
        {/* 细主脉，强化"叶"的识别度 */}
        <line x1="0" y1="0" x2="0" y2="-42" stroke={deep} strokeWidth={0.8} opacity={0.35} />
        <line x1="0" y1="0" x2="-14" y2="-30" stroke={deep} strokeWidth={0.6} opacity={0.3} />
        <line x1="0" y1="0" x2="14" y2="-30" stroke={deep} strokeWidth={0.6} opacity={0.3} />
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
    const dur = near ? 11 + random() * 5 : 15 + random() * 7
    return {
      left: random() * 100,
      size: near ? 24 + random() * 20 : 14 + random() * 13,
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
  const far = useMemo(() => makeLeaves(14, false), [])
  const near = useMemo(() => makeLeaves(12, true), [])
  const all = [...far, ...near]
  const motes = useMemo(
    () => {
      const random = sceneRandom(1943)
      return Array.from({ length: 16 }).map(() => ({
        left: random() * 100,
        top: random() * 100,
        size: 1 + random() * 1.5,
        dur: 10 + random() * 10,
        delay: random() * 8,
      }))
    },
    [],
  )
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

      {motes.map((m, i) => (
        <span
          key={`m${i}`}
          className="maple-mote absolute rounded-full"
          style={{
            left: `${m.left}%`,
            animationDuration: `${m.dur}s`,
            animationDelay: `${m.delay}s`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            background: 'rgba(255,224,178,0.6)',
          }}

        />
      ))}

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

