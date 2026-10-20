// Visual geometry and palette adapted from the user-owned Magic Patterns design.
// Source: https://www.magicpatterns.com/c/ckuiwzhktsyxpvxzxcva5h
/** 朝阳 —— 干净的渐变天空与海面，太阳升起一次后悬停。去除了所有突兀的阴影和遮罩。 */
export function SunriseTheme() {
  return (
    <div
      aria-hidden
      className="theme-scene sunrise-scene"
    >
      {/* 天色随日出只苏醒一次，随后安定下来，不再循环呼吸（呼应太阳的一次性升起） */}
      <div
        className="sunrise-sky absolute inset-0"

      />

      {/* 朝阳升起并悬停 (One-shot) - 放在海面后面 */}
      <div
        className="sunrise-sun absolute left-1/2 rounded-full"
        style={{
          width: 240,
          height: 240,
          marginLeft: -120,
          background:
            'radial-gradient(circle, rgba(255,245,225,1) 0%, rgba(255,228,180,0.8) 35%, rgba(255,228,180,0) 70%)',
        }}

      />

      {/* 干净的海面渐变，没有突兀的块或阴影 */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: '35%',
          background:
            'linear-gradient(180deg, rgba(216,224,229,0.85) 0%, rgba(205,214,219,1) 100%)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {/* 极简的海平线 */}
        <div
          className="absolute top-0 inset-x-0 h-[1px]"
          style={{
            background: 'rgba(255,255,255,0.4)',
          }}
        />

        {/* 旭日在水面投下的暖色倒影，随海面轻轻起伏 */}
        <div
          className="sunrise-reflection absolute top-0 left-1/2"
          style={{
            width: 70,
            height: '100%',
            marginLeft: -35,
            background:
              'linear-gradient(180deg, rgba(255,232,196,0.55) 0%, rgba(255,232,196,0.18) 55%, rgba(255,232,196,0) 100%)',
            filter: 'blur(3px)',
          }}

        />

        {/* 海面波光：几道粗细、相位各异的自然曲线替代机械重复条纹，随海面缓缓起伏 */}
        <svg
          className="sunrise-glints absolute inset-0 w-full h-full"
          viewBox="0 0 400 140"
          preserveAspectRatio="none"
          style={{ opacity: 0.38, filter: 'blur(1.2px)' }}

        >
          {[14, 32, 52, 74, 98, 124].map((y, index) => (
            <path
              key={index}
              d={`M0,${y} C60,${y - 4 - (index % 2) * 2} 120,${y + 4} 180,${y - 2} C240,${y - 6} 300,${y + 3} 400,${y}`}
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={1 + (index % 2) * 0.5}
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* 细腻水面颗粒，让渐变更通透，不显平板 */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>
    </div>
  )
}
export function SunrisePreview() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(180deg, #e7ecf1 0%, #f3ede4 55%, #f8e6c9 100%)',
      }}
    >
      <div
        className="absolute left-1/2 rounded-full"
        style={{
          width: 28,
          height: 28,
          marginLeft: -14,
          bottom: '25%',
          background:
            'radial-gradient(circle, #fff5e1 0%, rgba(255,228,180,0) 70%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: '35%',
          background: 'rgba(216,224,229,0.85)',
          borderTop: '1px solid rgba(255,255,255,0.4)',
        }}
      />
    </div>
  )
}

