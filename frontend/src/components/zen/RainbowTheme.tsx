import { SCENE_SURFACES } from './sceneSurfaces'
import { useId } from 'react'

// Keep the persisted `rainbow` identity. After rain now depicts clearing clouds,
// with a single daylight opening rather than a decorative spectrum.
function ClearingClouds() {
  const id = useId().replace(/:/g, '')
  return <svg className="after-rain-clouds" viewBox="0 0 1200 800" preserveAspectRatio="none">
    <defs>
      <linearGradient id={`${id}-cloud-far`} x1="0" y1="0" x2=".2" y2="1">
        <stop stopColor="#9fb8cc" stopOpacity=".58" />
        <stop offset=".7" stopColor="#e3edf3" stopOpacity=".74" />
        <stop offset="1" stopColor="#ffffff" stopOpacity=".86" />
      </linearGradient>
      <linearGradient id={`${id}-cloud-near`} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#ffffff" stopOpacity=".9" />
        <stop offset=".35" stopColor="#e2edf3" stopOpacity=".8" />
        <stop offset="1" stopColor="#a5bfd0" stopOpacity=".46" />
      </linearGradient>
      <filter id={`${id}-soft`} x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="10" /></filter>
    </defs>
    <g filter={`url(#${id}-soft)`}>
      <path className="after-rain-cloud-far" fill={`url(#${id}-cloud-far)`} d="M-100-80H900C850-5 754 20 698 62S624 109 550 93S448 76 397 120S297 163 224 141S93 144-100 214Z" />
      <path className="after-rain-cloud-near" fill={`url(#${id}-cloud-near)`} d="M-100 740C65 698 157 740 264 715S431 672 533 694S678 684 754 634S898 594 970 616S1130 602 1300 557V900H-100Z" />
    </g>
  </svg>
}

function AfterRainScene({ preview = false }: { preview?: boolean }) {
  return <div aria-hidden className={`theme-scene ${preview ? 'theme-preview ' : ''}after-rain-scene`} style={{ background: SCENE_SURFACES.rainbow }}>
    <ClearingClouds /><div className="after-rain-rays" /><div className="after-rain-daylight" />
  </div>
}

export function RainbowTheme() { return <AfterRainScene /> }
export function RainbowPreview() { return <AfterRainScene preview /> }
