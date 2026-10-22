import { SCENE_SURFACES } from './sceneSurfaces'
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
      viewBox="-42 -8 84 78"
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

interface Leaf {
  left: number
  size: number
  dur: number
  delay: number
  tone: number
  blur: number
  sway: number
  swayDuration: number
  tilt: number
}

function makeLeaves(count: number, near: boolean): Leaf[] {
  const random = sceneRandom(near ? 1941 : 1942)
  return Array.from({ length: count }).map(() => {
    const dur = near ? 23 + random() * 9 : 30 + random() * 12
    return {
      left: random() < 0.5 ? 8 + random() * 18 : 74 + random() * 18,
      size: near ? 38 + random() * 20 : 18 + random() * 12,
      dur,
      delay: -random() * dur,
      tone: Math.floor(random() * LEAF_TONES.length),
      blur: near ? 0 : 0.8,
      sway: near ? 42 + random() * 26 : 24 + random() * 18,
      swayDuration: 4.2 + random() * 1.8,
      tilt: 10 + random() * 6,
    }
  })
}

/** Separate constant descent from eased lateral swaying, with no sampled direction changes. */
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
        background: SCENE_SURFACES.maple,
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
              '--sway-distance': `${l.sway}px`,
              '--sway-duration': `${l.swayDuration}s`,
              '--sway-delay': `${l.delay}s`,
              '--sway-tilt': `${l.tilt}deg`,
              top: -l.size - 10,
              willChange: 'transform',
              filter: l.blur ? `blur(${l.blur}px)` : undefined,
            } as CSSProperties}

          >
            <div className="maple-leaf-sway"><MapleLeaf size={l.size} tone={l.tone} id={`${leafId}-${i}`} /></div>
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
      className="theme-scene theme-preview maple-scene"
      style={{
        background: SCENE_SURFACES.maple,
      }}
    >
      {[
        { l: 20, t: 24, s: 14, r: -18, tone: 0 },
        { l: 58, t: 42, s: 17, r: 22, tone: 1 },
        { l: 78, t: 16, s: 11, r: -12, tone: 2 },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: `${p.l}%`, top: `${p.t}%`, transform: `translate(-50%, -50%) rotate(${p.r}deg)` }}
        >
          <MapleLeaf size={p.s} tone={p.tone} id={`${leafId}-${i}`} />
        </div>
      ))}
    </div>
  )
}

