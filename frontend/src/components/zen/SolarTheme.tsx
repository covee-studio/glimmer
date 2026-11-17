import { useEffect, useId, useState, type CSSProperties } from 'react'
import { solarLightAt, solarBackground, type SolarLight } from './solarLight'

function localLight() {
  const now = new Date()
  return solarLightAt(now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600)
}
function useLocalLight() {
  const [light, setLight] = useState(localLight)
  useEffect(() => {
    const update = () => { if (document.visibilityState === 'visible') setLight(localLight()) }
    const timer = window.setInterval(update, 60_000)
    document.addEventListener('visibilitychange', update)
    window.addEventListener('focus', update)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', update)
      window.removeEventListener('focus', update)
    }
  }, [])
  return light
}

// Clearing clouds inherited from the retired After rain theme. They belong to
// the bright part of the day, so their opacity follows the solar phase: a
// hint at dawn, present through morning and noon, thinning by afternoon, and
// gone at dusk so the horizon glow stays undisturbed.
const CLOUD_OPACITY: Record<string, number> = {
  dawn: .4, morning: .85, noon: .8, afternoon: .5,
}

function ClearingClouds({ opacity }: { opacity: number }) {
  const id = useId().replace(/:/g, '')
  return <svg className="after-rain-clouds" style={{ opacity, transition: 'opacity 2.5s ease' }} viewBox="0 0 1200 800" preserveAspectRatio="none">
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

export function SolarArtwork({ light, preview = false }: { light: SolarLight; preview?: boolean }) {
  const cloudOpacity = CLOUD_OPACITY[light.name] ?? 0
  return <div aria-hidden className={`theme-scene solar-scene${preview ? ' theme-preview' : ''}`}
    data-solar-phase={light.name}
    style={{ background: solarBackground(light), '--solar-horizon': light.sky[3], '--solar-glow-height': `${light.glowHeight}%`, '--solar-glow-opacity': light.glowOpacity, '--solar-sky-light': light.skyLight } as CSSProperties}>
    <div className="solar-sky-light" />
    <div className="solar-horizon" />
    {cloudOpacity > 0 && <>
      <ClearingClouds opacity={cloudOpacity} />
      <div className="after-rain-daylight" style={{ opacity: cloudOpacity, transition: 'opacity 2.5s ease' }} />
    </>}
  </div>
}
export function SolarTheme() { return <SolarArtwork light={useLocalLight()} /> }
export function SolarPreview() { return <SolarArtwork light={useLocalLight()} preview /> }
