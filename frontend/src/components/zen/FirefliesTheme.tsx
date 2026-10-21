// Visual geometry and palette adapted from the user-owned Magic Patterns design.
// Source: https://www.magicpatterns.com/c/ckuiwzhktsyxpvxzxcva5h
import { useMemo, type CSSProperties } from 'react'
import { sceneRandom } from './sceneGeometry'

interface Firefly {
  left: number
  top: number
  size: number
  dur: number
  delay: number
  x: number[]
  y: number[]
  opacity: number[]
  times: number[]
}

interface Tuft {
  left: number
  scale: number
  duration: number
  delay: number
  angle: number
}

function makeFireflies(count: number): Firefly[] {
  const random = sceneRandom(622)
  return Array.from({ length: count }).map(() => {
    const steps = 14
    const times = Array.from({ length: steps + 1 }, (_, index) => index / steps)
    const phase = random() * Math.PI * 2
    const phaseY = random() * Math.PI * 2
    const rangeX = 14 + random() * 28
    const rangeY = 10 + random() * 22
    const brightnessPhase = random() * Math.PI * 2

    const x = times.map(
      (time) =>
        rangeX *
        (Math.sin(phase + Math.PI * 2 * time) - Math.sin(phase)) *
        (0.72 + 0.18 * Math.sin(Math.PI * 2 * time)),
    )
    const y = times.map(
      (time) =>
        rangeY *
        (Math.sin(phaseY + Math.PI * 2 * time) - Math.sin(phaseY)) *
        0.65,
    )
    const opacity = times.map((time) => {
      const pulse = 0.5 + 0.5 * Math.sin(brightnessPhase + Math.PI * 4 * time)
      return 0.12 + pulse * 0.54
    })

    return {
      left: 4 + random() * 92,
      top: 68 + random() * 24,
      size: 2.2 + random() * 2.6,
      dur: 16 + random() * 10,
      delay: -random() * 10,
      x,
      y,
      opacity,
      times,
    }
  })
}

/** 一丛草茎剪影。每簇拥有独立节奏，避免整片草地机械同步。 */
function GrassTuft({ tuft }: { tuft: Tuft }) {
  const blades = [
    'M0,40 C-2,26 -1,12 3,0',
    'M4,40 C4,24 7,10 9,0',
    'M8,40 C10,26 14,14 15,2',
    'M-4,40 C-6,26 -5,12 -2,2',
  ]
  return (
    <svg
      className="firefly-grass absolute bottom-0"
      style={{
        left: `${tuft.left}%`,
        width: 24,
        height: 44,
        transformOrigin: 'bottom center',
        animationDuration: `${tuft.duration}s`,
        animationDelay: `${tuft.delay}s`,
        '--grass-angle': `${tuft.angle}deg`,
      } as CSSProperties}
      viewBox="-10 0 30 44"

    >
      <g transform={`scale(${tuft.scale})`}>
        {blades.map((d, index) => (
          <path
            key={index}
            d={d}
            fill="none"
            stroke="rgba(6,10,6,0.6)"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  )
}

/** 萤火虫 —— 夏夜草丛间，点点暖光沿各自连续的小范围轨迹游荡、自然明灭。 */
export function FirefliesTheme() {
  const flies = useMemo(() => makeFireflies(14), [])
  const tufts = useMemo<Tuft[]>(
    () => {
      const random = sceneRandom(623)
      return Array.from({ length: 9 }).map((_, index) => ({
        left: 4 + index * 11 + random() * 4,
        scale: 0.8 + random() * 0.6,
        duration: 4.4 + random() * 2.4,
        delay: -random() * 5,
        angle: 3 + random() * 4,
      }))
    },
    [],
  )

  return (
    <div
      aria-hidden
      className="theme-scene fireflies-scene"
      style={{
        background:
          'linear-gradient(180deg, #0d1a15 0%, #14251c 55%, #0a1410 100%)',
      }}
    >
      <div
        className="absolute"
        style={{
          top: '8%',
          right: '14%',
          width: 42,
          height: 42,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(232,230,200,0.22) 0%, rgba(232,230,200,0.05) 45%, rgba(232,230,200,0) 70%)',
          filter: 'blur(2px)',
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-[24%]">
        {tufts.map((tuft, index) => (
          <GrassTuft key={index} tuft={tuft} />
        ))}
      </div>

      <div className="reading-safe-particles">
        {flies.map((fly, index) => (
          <span
            key={index}
            className="firefly-light absolute rounded-full"
            style={{
              left: `${fly.left}%`,
              animationDuration: `${fly.dur}s`,
              animationDelay: `${fly.delay}s`,
              ...Object.fromEntries(fly.times.flatMap((_, i) => [
                [`--fly-x${i}`, `${fly.x[i]}px`],
                [`--fly-y${i}`, `${fly.y[i]}px`],
                [`--fly-o${i}`, fly.opacity[i]],
              ])),
              top: `${fly.top}%`,
              width: fly.size,
              height: fly.size,
              background: 'rgba(255,226,140,0.95)',
              boxShadow: '0 0 5px 1.5px rgba(255,220,120,0.42)',
            }}

          />
        ))}

      </div>

      {/* 极细腻的颗粒，打散深色渐变天空容易出现的色带 */}
      <div
        className="absolute inset-0 opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}

export function FirefliesPreview() {
  return (
    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(180deg, #0d1a15 0%, #0a1410 100%)' }}
    >
      <div
        className="absolute"
        style={{
          top: '14%',
          right: '18%',
          width: 12,
          height: 12,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(232,230,200,0.25) 0%, rgba(232,230,200,0) 70%)',
        }}
      />
      {[
        { l: 12, t: 70 },
        { l: 55, t: 84 },
        { l: 78, t: 72 },
        { l: 34, t: 78 },
        { l: 90, t: 82 },
      ].map((point, index) => (
        <span
          key={index}
          className="absolute rounded-full"
          style={{
            left: `${point.l}%`,
            top: `${point.t}%`,
            width: 3,
            height: 3,
            background: 'rgba(255,226,140,0.95)',
            boxShadow: '0 0 6px 2px rgba(255,220,120,0.42)',
          }}
        />
      ))}
    </div>
  )
}

