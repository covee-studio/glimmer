// Visual geometry and trajectories adapted from the user-owned Magic Patterns design.
// Source: https://www.magicpatterns.com/c/ckuiwzhktsyxpvxzxcva5h
import { useMemo, type CSSProperties } from 'react'
import { sceneRandom } from './sceneGeometry'

interface FallTrajectory {
  x: number[]
  y: string[]
  rotate: number[]
  times: number[]
}

interface Petal {
  left: number
  top: number
  size: number
  dur: number
  delay: number
  tone: number
  blur: number
  trajectory: FallTrajectory
}

const PETAL_TONES = ['#f3c3cf', '#f6d2da', '#eeb2c1', '#fae1e6']

/** 单瓣樱花的镂空轮廓：外缘顶端带一处浅浅的缺口，基部收窄，贴近真实花瓣。 */
const PETAL_CLIP =
  'polygon(50% 100%, 74% 88%, 92% 62%, 96% 38%, 82% 14%, 60% 4%, 50% 16%, 40% 4%, 18% 14%, 4% 38%, 8% 62%, 26% 88%)'

/** 单片小花瓣的 SVG 路径（以花心为原点，向上展开），用于组成完整的五瓣花朵。 */
const BLOSSOM_PETAL_D =
  'M0,0 C-2.4,-1.6 -3.4,-4.2 -1.3,-5.8 C-0.6,-6.4 0,-6 0,-5.4 C0,-6 0.6,-6.4 1.3,-5.8 C3.4,-4.2 2.4,-1.6 0,0 Z'

/**
 * 樱花更轻，采用略多于一次的低频摆振，并叠加极弱的二次谐波模拟微风。
 * 横向位置、下沉速度和旋转姿态来自同一相位，因此转向时不会突然折返。
 */
function makePetalTrajectory(near: boolean, random: () => number): FallTrajectory {
  const steps = 24
  const times = Array.from({ length: steps + 1 }, (_, index) => index / steps)
  const phase = random() * Math.PI * 2
  const cycles = 0.9 + random() * 0.42
  const sway = (near ? 20 : 10) + random() * (near ? 22 : 14)
  const drift = -14 + random() * 28
  const bob = 2 + random() * 2.2
  const spin = (random() > 0.5 ? 1 : -1) * (80 + random() * 100)
  const initialWave = Math.sin(phase)
  const initialSecondary = Math.sin(phase * 0.8)

  const x = times.map((time) => {
    const wave = Math.sin(phase + Math.PI * 2 * cycles * time) - initialWave
    const secondary =
      Math.sin(phase * 0.8 + Math.PI * 4 * cycles * time) - initialSecondary
    return sway * (wave + secondary * 0.16) + drift * time
  })

  const y = times.map((time) => {
    const verticalFlutter =
      Math.sin(phase + Math.PI * 2 * cycles * time) - initialWave
    return `${-12 + 126 * time + bob * verticalFlutter}vh`
  })

  const rotate = times.map(
    (time) =>
      spin * time +
      8 * Math.cos(phase + Math.PI * 2 * cycles * time) +
      3 * Math.sin(phase + Math.PI * 4 * cycles * time),
  )

  return { x, y, rotate, times }
}

function makePetals(count: number, near: boolean): Petal[] {
  const random = sceneRandom(near ? 2041 : 2042)
  return Array.from({ length: count }).map(() => {
    const dur = near ? 15 + random() * 6 : 21 + random() * 8
    return {
      left: random() * 100,
      top: -10 - random() * 20,
      size: near ? 9 + random() * 6 : 5 + random() * 4,
      dur,
      delay: -random() * dur,
      tone: Math.floor(random() * PETAL_TONES.length),
      blur: near ? 0 : 1.1,
      trajectory: makePetalTrajectory(near, random),
    }
  })
}

/** 一朵完整的五瓣樱花：五片小花瓣绕花心均匀排列，中心一点鹅黄花蕊。 */
function Blossom({
  cx,
  cy,
  scale = 1,
  tone = 0,
}: {
  cx: number
  cy: number
  scale?: number
  tone?: number
}) {
  const fill = PETAL_TONES[tone % PETAL_TONES.length]
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          d={BLOSSOM_PETAL_D}
          fill={fill}
          opacity={0.95}
          transform={`rotate(${a})`}
        />
      ))}
      <circle r={1} fill="#f6e6a8" />
    </g>
  )
}

/** 樱花树 —— 一枝虬曲的樱枝自角落探入画面，枝头缀满真实的五瓣樱花，花瓣一路旋转飘落。 */
export function SakuraTheme() {
  const far = useMemo(() => makePetals(8, false), [])
  const near = useMemo(() => makePetals(8, true), [])
  const all = [...far, ...near]
  const blossoms = useMemo(
    () => [
      { cx: 140, cy: 58, scale: 2.2, tone: 0 },
      { cx: 158, cy: 66, scale: 1.7, tone: 1 },
      { cx: 128, cy: 118, scale: 2.0, tone: 2 },
      { cx: 140, cy: 128, scale: 1.5, tone: 3 },
      { cx: 262, cy: 54, scale: 2.2, tone: 1 },
      { cx: 280, cy: 44, scale: 1.7, tone: 0 },
      { cx: 288, cy: 10, scale: 1.5, tone: 2 },
      { cx: 300, cy: 22, scale: 1.9, tone: 3 },
      { cx: 40, cy: 24, scale: 1.8, tone: 0 },
      { cx: 58, cy: 16, scale: 1.5, tone: 1 },
      { cx: 326, cy: 92, scale: 1.9, tone: 2 },
      { cx: 312, cy: 100, scale: 1.5, tone: 3 },
    ],
    [],
  )
  return (
    <div
      aria-hidden
      className="theme-scene sakura-scene"
      style={{
        background:
          'linear-gradient(180deg, #f8ecee 0%, #f9f1ee 45%, #f4e2df 100%)',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 60%)',
        }}
      />

      {/* 一枝虬曲的樱枝，自左上角探入，缀满真实的五瓣樱花 */}
      <svg
        className="sakura-branch absolute top-7 -left-6"
        width={340}
        height={220}
        viewBox="0 0 340 220"
        style={{ overflow: 'visible', transformOrigin: '0px 0px' }}

      >
        {/* 主枝：深色底纹 + 浅色高光细纹，模拟树皮质感 */}
        <path
          d="M0,10 C60,20 90,55 140,60 C190,65 215,40 260,55 C290,65 300,90 330,95"
          fill="none"
          stroke="rgba(60,46,40,0.6)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <path
          d="M1,9 C60,19 89,54 139,59 C189,64 214,39 259,54 C289,64 299,89 329,94"
          fill="none"
          stroke="rgba(158,128,106,0.32)"
          strokeWidth={1.1}
          strokeLinecap="round"
        />

        {/* 主要分枝 */}
        <path
          d="M120,58 C130,80 118,100 132,118"
          fill="none"
          stroke="rgba(72,56,50,0.5)"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <path
          d="M245,52 C255,32 275,28 288,12"
          fill="none"
          stroke="rgba(72,56,50,0.5)"
          strokeWidth={2.2}
          strokeLinecap="round"
        />

        {blossoms.map((b, i) => (
          <Blossom key={i} cx={b.cx} cy={b.cy} scale={b.scale} tone={b.tone} />
        ))}
      </svg>

      <div className="reading-safe-particles">
        {all.map((p, i) => (
          <span
            key={i}
            className="sakura-petal absolute"
            style={{
              left: `${p.left}%`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              '--fall-still-y': `${12 + (i / all.length) * 82}vh`,
              ...Object.fromEntries(p.trajectory.times.flatMap((_, step) => [
                [`--fall-x${step}`, `${p.trajectory.x[step]}px`],
                [`--fall-y${step}`, p.trajectory.y[step]],
                [`--fall-r${step}`, `${p.trajectory.rotate[step]}deg`],
              ])),
              top: p.top,
              width: p.size,
              height: p.size * 1.15,
              background: `radial-gradient(circle at 35% 28%, #fff5f7 0%, ${PETAL_TONES[p.tone]} 72%)`,
              clipPath: PETAL_CLIP,
              filter: p.blur ? `blur(${p.blur}px)` : undefined,
            } as CSSProperties}

          />
        ))}
      </div>
    </div>
  )
}

export function SakuraPreview() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(180deg, #f8ecee 0%, #f4e2df 100%)',
      }}
    >
      <svg
        className="absolute -top-2 -left-3"
        width={90}
        height={60}
        viewBox="0 0 90 60"
        style={{ overflow: 'visible' }}
      >
        <path
          d="M0,4 C20,8 30,20 45,22 C58,24 66,14 84,18"
          fill="none"
          stroke="rgba(72,56,50,0.55)"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {[
          { cx: 40, cy: 20, tone: 0 },
          { cx: 50, cy: 24, tone: 1 },
          { cx: 70, cy: 16, tone: 2 },
          { cx: 80, cy: 20, tone: 3 },
          { cx: 10, cy: 8, tone: 1 },
        ].map((b, i) => (
          <Blossom key={i} cx={b.cx} cy={b.cy} scale={1.4} tone={b.tone} />
        ))}
      </svg>
      {[
        { l: 25, t: 40, s: 7, r: 20 },
        { l: 55, t: 55, s: 6, r: 60 },
        { l: 72, t: 35, s: 7, r: -20 },
        { l: 40, t: 70, s: 6, r: 40 },
      ].map((p, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${p.l}%`,
            top: `${p.t}%`,
            width: p.s,
            height: p.s * 1.15,
            background: `radial-gradient(circle at 35% 28%, #fff5f7 0%, ${PETAL_TONES[i % PETAL_TONES.length]} 72%)`,
            clipPath: PETAL_CLIP,
            transform: `rotate(${p.r}deg)`,
          }}
        />
      ))}
    </div>
  )
}

