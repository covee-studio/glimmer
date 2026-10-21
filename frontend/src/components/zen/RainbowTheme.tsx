import { useId } from 'react'

// Keep the persisted `rainbow` identity; the visual direction is now "After rain".
function RefractedLight() {
  const id = useId().replace(/:/g, '')
  return <svg className="after-rain-light" viewBox="0 0 1200 800" preserveAspectRatio="none">
    <defs>
      <radialGradient id={`${id}-spectrum`}>
        <stop offset="0.93" stopColor="#c6b7ed" stopOpacity="0" />
        <stop offset="0.944" stopColor="#c6b7ed" stopOpacity=".28" />
        <stop offset="0.957" stopColor="#b4d4f3" stopOpacity=".34" />
        <stop offset="0.97" stopColor="#bce1d0" stopOpacity=".32" />
        <stop offset="0.98" stopColor="#f8e8b4" stopOpacity=".32" />
        <stop offset="0.99" stopColor="#f5c0b8" stopOpacity=".28" />
        <stop offset="1" stopColor="#f5c0b8" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="white" stopOpacity=".15" />
        <stop offset=".45" stopColor="white" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <mask id={`${id}-veil`}><rect width="1200" height="800" fill={`url(#${id}-fade)`} /></mask>
    </defs>
    <g className="after-rain-ribbon after-rain-ribbon-cool" mask={`url(#${id}-veil)`}>
      <circle cx="1450" cy="950" r="850" fill={`url(#${id}-spectrum)`} />
    </g>
  </svg>
}

export function RainbowTheme() {
  return <div aria-hidden className="theme-scene after-rain-scene">
    <RefractedLight /><div className="after-rain-sun" /><div className="after-rain-haze" />
  </div>
}

export function RainbowPreview() {
  return <div className="theme-scene theme-preview after-rain-scene"><RefractedLight /></div>
}
