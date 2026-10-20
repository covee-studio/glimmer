// Visual geometry and palette adapted from the user-owned Magic Patterns design.
// Source: https://www.magicpatterns.com/c/ckuiwzhktsyxpvxzxcva5h
import { useId, useMemo } from 'react'

const BANK_D =
  'M0,34 C60,24 100,50 160,42 C220,34 260,54 320,44 C360,38 380,48 400,42 L400,140 L0,140 Z'

/** 一枚半露水面的鹅卵石：顶部亮、底部暗，带一点水渍投影，比单色扁平块更有体积感。 */
function Pebble({ size, tone }: { size: number; tone: 'light' | 'mid' | 'dark' }) {
  const fills: Record<string, [string, string]> = {
    light: ['#9aa79a', '#5f6b5c'],
    mid: ['#8b9a90', '#4f5c50'],
    dark: ['#7c8b7e', '#434f44'],
  }
  const [top, base] = fills[tone]
  return (
    <svg width={size} height={size * 0.68} viewBox="0 0 40 28" style={{ overflow: 'visible' }}>
      <ellipse cx="20" cy="16" rx="18" ry="10" fill={base} />
      <ellipse cx="18" cy="11" rx="13" ry="7" fill={top} opacity={0.85} />
      <ellipse cx="24" cy="22" rx="16" ry="4" fill="rgba(30,38,32,0.18)" />
    </svg>
  )
}

/** 溪流 —— 一弯浅溪沿画面底部静静流过，几方卵石半露水面，水面微光缓缓游移，偶有涟漪荡开。 */
export function StreamTheme() {
  const waterId = useId()
  const pebbles = useMemo(
    () => [
      { left: 14, size: 34, tone: 'mid' as const },
      { left: 46, size: 24, tone: 'dark' as const },
      { left: 63, size: 40, tone: 'light' as const },
      { left: 84, size: 26, tone: 'mid' as const },
    ],
    [],
  )
  const ripples = useMemo(
    () => [
      { left: 63, delay: 0 },
      { left: 63, delay: 1.3 },
      { left: 14, delay: 2.1 },
    ],
    [],
  )
  return (
    <div
      aria-hidden
      className="theme-scene stream-scene"
      style={{
        background: 'linear-gradient(180deg, #f2f4ee 0%, #eef2ec 60%, #e7ede6 100%)',
      }}
    >
      {/* 溪水沿底部铺开 */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: '30%' }}>


        <svg
          className="absolute inset-0"
          width="100%"
          height="100%"
          viewBox="0 0 400 140"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={waterId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#aec4bc" />
              <stop offset="45%" stopColor="#92ada6" />
              <stop offset="100%" stopColor="#7a978f" />
            </linearGradient>
          </defs>
          <path d={BANK_D} fill={`url(#${waterId})`} />
          <path d={BANK_D} fill="none" stroke="rgba(90,108,86,0.12)" strokeWidth={1.5} />
        </svg>

        {/* 水面流光：柔和模糊的光带缓缓游移，替代生硬的虚线描边 */}
        {[0, 1].map((i) => (
          <div
            key={i}
            className="stream-shimmer absolute rounded-full"
            style={{
              top: `${30 + i * 26}%`,
              animationDuration: `${i ? 10 : 8}s`,
              animationDelay: `${i * 1.8}s`,
              width: '46%',
              height: i ? 10 : 14,
              background:
                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
              filter: 'blur(4px)',
            }}

          />
        ))}

        {/* 半露水面的卵石，底部补一圈水面折射光，加强"半浸"的体积感 */}
        {pebbles.map((p, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: `${p.left}%`, bottom: '48%', transform: 'translateX(-50%)' }}
          >
            <div
              className="stream-shimmer absolute rounded-full"
              style={{
                left: '50%',
                bottom: -3,
                width: p.size * 0.8,
                height: 5,
                marginLeft: -(p.size * 0.4),
                background:
                  'radial-gradient(ellipse, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 72%)',
              }}
            />
            <Pebble size={p.size} tone={p.tone} />
          </div>
        ))}

        {/* 石边荡开的涟漪 */}
        {ripples.map((rp, i) => (
          <div
            key={i}
            className="stream-ripple absolute rounded-full border border-white/60"
            style={{ animationDelay: `${rp.delay}s`, left: `${rp.left}%`, bottom: '54%', width: 6, height: 6, transform: 'translateX(-50%)' }}

          />
        ))}
      </div>
    </div>
  )
}

export function StreamPreview() {
  const waterId = useId()
  return (
    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(180deg, #f2f4ee 0%, #e7ede6 100%)' }}
    >
      <div className="absolute inset-x-0 bottom-0" style={{ height: '42%' }}>
        <svg
          className="absolute inset-0"
          width="100%"
          height="100%"
          viewBox="0 0 400 140"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={waterId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b7cbc4" />
              <stop offset="100%" stopColor="#8fa9a4" />
            </linearGradient>
          </defs>
          <path d={BANK_D} fill={`url(#${waterId})`} opacity={0.9} />
        </svg>
        <div className="absolute" style={{ left: '30%', bottom: '52%', transform: 'translateX(-50%)' }}>
          <Pebble size={22} tone="mid" />
        </div>
        <div className="absolute" style={{ left: '62%', bottom: '58%', transform: 'translateX(-50%)' }}>
          <Pebble size={30} tone="light" />
        </div>
      </div>
    </div>
  )
}

