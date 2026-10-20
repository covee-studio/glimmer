// Visual geometry and palette adapted from the user-owned Magic Patterns design.
// Source: https://www.magicpatterns.com/c/ckuiwzhktsyxpvxzxcva5h
import { useId, useMemo } from 'react'
import { sceneRandom } from './sceneGeometry'

/** 细腻的沙粒噪点，取代机械重复的条纹，让沙面质感更接近天然耙沙而非 CSS 网格。 */
const SAND_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

interface Stone {
  cx: number
  cy: number
  rx: number
  ry: number
  rotate: number
  rings: number[]
}

/** 一方带体积感的观赏石：暗部、亮部分层塑形，并投下一圈柔和的接地投影，而不是一片扁平色块。 */
function RockCluster({ stone, id }: { stone: Stone; id: string }) {
  const { cx, cy, rx, ry, rotate } = stone
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rotate})`}>
      {/* 接地投影，朝一致的光源方向（左上）略微偏移，给石头落地的重量感 */}
      <ellipse cx={rx * 0.12} cy={ry * 0.92} rx={rx * 1.18} ry={ry * 0.42} fill="rgba(90,76,52,0.22)" />
      <defs>
        <radialGradient id={id} cx="34%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#8d8274" />
          <stop offset="55%" stopColor="#5c5346" />
          <stop offset="100%" stopColor="#3c362c" />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={`url(#${id})`} />
      {/* 顶部受光高光，强化体积感 */}
      <ellipse cx={-rx * 0.28} cy={-ry * 0.34} rx={rx * 0.42} ry={ry * 0.26} fill="rgba(216,206,182,0.38)" />
      {/* 侧面一道极淡的裂纹，增加石头的真实肌理 */}
      <path
        d={`M${-rx * 0.5},${-ry * 0.1} Q${-rx * 0.1},${ry * 0.25} ${rx * 0.4},${ry * 0.15}`}
        fill="none"
        stroke="rgba(40,36,30,0.25)"
        strokeWidth={1}
      />
    </g>
  )
}

/**
 * 枯山水 —— 一条沿底部铺展的耙沙园地：三方错落观赏石，石边耙出同心圆纹，
 * 开阔处是缓缓起伏的直线耙痕，线条粗细、间距刻意带一点手耙的不规则感。
 * 整体锚定在画面底部，呼应其他主题"落地成景"的构图逻辑，中央阅读区完全留白。
 */
export function ZenGardenTheme() {
  const rockId = useId()
  const stones = useMemo<Stone[]>(
    () => [
      { cx: 190, cy: 118, rx: 34, ry: 15, rotate: -6, rings: [26, 40, 54, 68] },
      { cx: 640, cy: 104, rx: 22, ry: 10, rotate: 10, rings: [18, 29, 40] },
      { cx: 980, cy: 128, rx: 16, ry: 7.5, rotate: -14, rings: [13, 21, 29] },
    ],
    [],
  )

  // 若干道贯穿全宽的耙痕，每道粗细、振幅、相位都略有差异，避免机械重复
  const rakeLines = useMemo(
    () => {
      const random = sceneRandom(8093)
      return Array.from({ length: 7 }).map((_, index) => ({
        y: 20 + index * 15 + Math.sin(index * 1.7) * 3,
        amp: 3 + random() * 3,
        phase: random() * Math.PI * 2,
        width: 0.8 + random() * 0.6,
        opacity: 0.16 + random() * 0.1,
      }))
    },
    [],
  )

  const rakePath = (y: number, amp: number, phase: number) => {
    const points: string[] = []
    for (let x = 0; x <= 1100; x += 55) {
      const yy = y + Math.sin(phase + x * 0.012) * amp
      points.push(`${x === 0 ? 'M' : 'L'}${x},${yy.toFixed(1)}`)
    }
    return points.join(' ')
  }

  return (
    <div
      aria-hidden
      className="theme-scene zengarden-scene"
      style={{
        background: 'linear-gradient(180deg, #f1e9d6 0%, #ece2c6 55%, #ddcfa9 100%)',
      }}
    >
      {/* 一缕极柔和的斜向天光，打破纯平背景，但不形成任何硬边 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 22% 12%, rgba(255,252,240,0.45) 0%, rgba(255,252,240,0) 62%)',
        }}
      />

      {/* 细腻沙粒质感，替代机械重复条纹 */}
      <div
        className="absolute inset-0 opacity-[0.1] mix-blend-multiply"
        style={{ backgroundImage: SAND_GRAIN }}
      />

      {/* 沿底部铺展的耙沙园地：开阔处是直线耙痕，石边耙出同心圆纹 */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        style={{ height: '27%' }}
        viewBox="0 0 1100 160"
        preserveAspectRatio="none"
      >
        {/* 开阔沙地的直线耙痕，振幅与相位各异，带一点手耙的不规则感 */}
        {rakeLines.map((line, index) => (
          <path
            key={index}
            d={rakePath(line.y, line.amp, line.phase)}
            fill="none"
            stroke="rgba(112,96,64,0.4)"
            strokeWidth={line.width}
            opacity={line.opacity}
            strokeLinecap="round"
          />
        ))}

        {/* 三方观赏石，各自耙出围绕石身的同心圆纹 */}
        {stones.map((stone, index) => (
          <g key={index}>
            {stone.rings.map((r, ringIndex) => (
              <ellipse
                key={ringIndex}
                cx={stone.cx}
                cy={stone.cy}
                rx={r}
                ry={r * 0.35}
                fill="none"
                stroke="rgba(112,96,64,0.38)"
                strokeWidth={0.9}
                opacity={0.5 - ringIndex * 0.08}
              />
            ))}
          </g>
        ))}

        {/* 石头置于圆纹之上，确保清晰的前后层次 */}
        {stones.map((stone, index) => (
          <RockCluster key={index} stone={stone} id={`${rockId}-${index}`} />
        ))}
      </svg>
    </div>
  )
}

export function ZenGardenPreview() {
  const rockId = useId()
  const stones: Stone[] = [
    { cx: 46, cy: 54, rx: 11, ry: 5, rotate: -6, rings: [9, 15, 21] },
    { cx: 92, cy: 50, rx: 6.5, ry: 3, rotate: 12, rings: [6, 10] },
  ]
  const rakeY = [14, 24, 34, 44]

  return (
    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(180deg, #f1e9d6 0%, #ddcfa9 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.1] mix-blend-multiply"
        style={{ backgroundImage: SAND_GRAIN }}
      />
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        style={{ height: '60%' }}
        viewBox="0 0 120 64"
        preserveAspectRatio="none"
      >
        {rakeY.map((y, index) => (
          <path
            key={index}
            d={`M0,${y} L120,${y + Math.sin(index) * 1.4}`}
            stroke="rgba(112,96,64,0.4)"
            strokeWidth={0.7}
            opacity={0.3}
          />
        ))}
        {stones.map((stone, index) => (
          <g key={index}>
            {stone.rings.map((r, ringIndex) => (
              <ellipse
                key={ringIndex}
                cx={stone.cx}
                cy={stone.cy}
                rx={r}
                ry={r * 0.35}
                fill="none"
                stroke="rgba(112,96,64,0.38)"
                strokeWidth={0.7}
                opacity={0.45 - ringIndex * 0.1}
              />
            ))}
          </g>
        ))}
        {stones.map((stone, index) => (
          <RockCluster key={index} stone={stone} id={`${rockId}-${index}`} />
        ))}
      </svg>
    </div>
  )
}

