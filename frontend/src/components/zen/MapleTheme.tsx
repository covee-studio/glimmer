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

/**
 * 枫枝自右上角探入，与樱的左上角形成同一套构图语言、不同季节身份：
 * 樱是粉色的春，枫是琥珀色的秋。枝上叶片俯视挂落，给主题一个稳定的锚点，
 * 不再只依赖稀疏的飘落粒子。
 */
const BRANCH_LEAVES = [
  { x: 318, y: 26, size: 34, tone: 0, r: 24 },
  { x: 288, y: 38, size: 28, tone: 1, r: -14 },
  { x: 252, y: 48, size: 38, tone: 2, r: 38 },
  { x: 214, y: 62, size: 26, tone: 3, r: -30 },
  { x: 178, y: 76, size: 33, tone: 1, r: 16 },
  { x: 140, y: 92, size: 24, tone: 0, r: -42 },
  { x: 104, y: 108, size: 30, tone: 2, r: 28 },
  { x: 236, y: 34, size: 22, tone: 3, r: 52 },
  { x: 160, y: 60, size: 20, tone: 0, r: -58 },
]

function MapleBranch() {
  const leafId = useId()
  return (
    <svg
      className="maple-branch absolute top-4 -right-4"
      width={360}
      height={230}
      viewBox="0 0 360 230"
      style={{ overflow: 'visible', transformOrigin: '360px 0px' }}
    >
      {/* 主枝：深色底纹加一道浅色高光，与樱枝同一笔法 */}
      <path
        d="M356,8 C310,18 288,30 258,42 C220,58 190,68 152,82 C118,94 92,102 58,122"
        fill="none"
        stroke="rgba(74,52,36,0.6)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d="M355,7 C310,17 288,29 257,41 C220,57 190,67 152,81 C118,93 92,101 59,121"
        fill="none"
        stroke="rgba(178,138,102,0.3)"
        strokeWidth={1.1}
        strokeLinecap="round"
      />
      {/* 分枝 */}
      <path
        d="M236,54 C228,38 214,30 202,22"
        fill="none"
        stroke="rgba(82,58,42,0.5)"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <path
        d="M158,80 C148,66 134,58 122,52"
        fill="none"
        stroke="rgba(82,58,42,0.5)"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      {BRANCH_LEAVES.map((leaf, i) => (
        <g key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r})`}>
          <MapleLeaf size={leaf.size} tone={leaf.tone} id={`${leafId}-branch-${i}`} />
        </g>
      ))}
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
  const far = useMemo(() => makeLeaves(6, false), [])
  const near = useMemo(() => makeLeaves(6, true), [])
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

      <MapleBranch />

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
      <svg
        className="absolute top-0 -right-1"
        width={70}
        height={44}
        viewBox="0 0 90 56"
        style={{ overflow: 'visible' }}
      >
        <path d="M92 3C72 7 60 13 46 19C32 25 20 29 6 38L6.6 38.6C21 30 33 26 47 20C61 14 73 8.4 92 5Z" fill="#7d5a42" />
        {[
          { x: 76, y: 10, s: 13, r: 24, tone: 0 },
          { x: 50, y: 20, s: 16, r: -18, tone: 2 },
          { x: 22, y: 33, s: 12, r: 30, tone: 1 },
        ].map((leaf, i) => (
          <g key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r})`}>
            <MapleLeaf size={leaf.s} tone={leaf.tone} id={`${leafId}-p-${i}`} />
          </g>
        ))}
      </svg>
      {[
        { l: 20, t: 58, s: 14, r: -18, tone: 0 },
        { l: 56, t: 74, s: 17, r: 22, tone: 1 },
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
