import { useEffect, useState, type CSSProperties } from 'react'
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

export function SolarArtwork({ light, preview = false }: { light: SolarLight; preview?: boolean }) {
  return <div aria-hidden className={`theme-scene solar-scene${preview ? ' theme-preview' : ''}`}
    data-solar-phase={light.name}
    style={{ background: solarBackground(light), '--solar-horizon': `${light.sky[3]}b3` } as CSSProperties}>
    <div className="solar-sky-light" />
    <div className="solar-horizon" />
  </div>
}
export function SolarTheme() { return <SolarArtwork light={useLocalLight()} /> }
export function SolarPreview() { return <SolarArtwork light={useLocalLight()} preview /> }
