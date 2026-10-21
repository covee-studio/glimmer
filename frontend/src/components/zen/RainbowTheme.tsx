import { useId } from 'react'

// Keep the persisted `rainbow` identity; the visual direction is now "After rain".
function RefractedLight() {
  const id = useId().replace(/:/g, '')
  return <svg className="after-rain-light" viewBox="0 0 1200 800" preserveAspectRatio="none">
    <defs>
      <radialGradient id={`${id}-spectrum`}>
        <stop offset="0.88" stopColor="#a8b7d9" stopOpacity="0" />
        <stop offset="0.895" stopColor="#aaa4cf" stopOpacity=".36" />
        <stop offset="0.914" stopColor="#9bbdd9" stopOpacity=".46" />
        <stop offset="0.933" stopColor="#afd1c4" stopOpacity=".48" />
        <stop offset="0.952" stopColor="#e4dfad" stopOpacity=".46" />
        <stop offset="0.97" stopColor="#e9c7ab" stopOpacity=".42" />
        <stop offset="0.985" stopColor="#dcb4b1" stopOpacity=".28" />
        <stop offset="1" stopColor="#dcb4b1" stopOpacity="0" />
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
