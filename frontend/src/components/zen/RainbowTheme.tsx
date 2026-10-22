import { SCENE_SURFACES } from './sceneSurfaces'
import { useId } from 'react'

// Keep the persisted `rainbow` identity; the visual direction is now "After rain".
// The tiny cover needs a wider spectrum to remain legible at ~67px.
function RefractedLight({ preview = false }: { preview?: boolean }) {
  const id = useId().replace(/:/g, '')
  return <svg className="after-rain-light" viewBox={preview ? "0 0 120 80" : "0 0 1200 800"} preserveAspectRatio="none">
    <defs>
      <radialGradient id={`${id}-spectrum`}>
        <stop offset={preview ? .85 : .93} stopColor="#c6b7ed" stopOpacity="0" />
        <stop offset={preview ? .875 : .944} stopColor="#c6b7ed" stopOpacity={preview ? .55 : .28} />
        <stop offset={preview ? .905 : .957} stopColor="#b4d4f3" stopOpacity={preview ? .62 : .34} />
        <stop offset={preview ? .935 : .97} stopColor="#bce1d0" stopOpacity={preview ? .6 : .32} />
        <stop offset={preview ? .96 : .98} stopColor="#f8e8b4" stopOpacity={preview ? .6 : .32} />
        <stop offset={preview ? .983 : .99} stopColor="#f5c0b8" stopOpacity={preview ? .55 : .28} />
        <stop offset="1" stopColor="#f5c0b8" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="white" stopOpacity=".15" />
        <stop offset=".45" stopColor="white" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <mask id={`${id}-veil`}><rect width={preview ? 120 : 1200} height={preview ? 80 : 800} fill={`url(#${id}-fade)`} /></mask>
    </defs>
    <g className="after-rain-ribbon after-rain-ribbon-cool" mask={`url(#${id}-veil)`}>
      <circle cx={preview ? 130 : 1450} cy={preview ? 90 : 950} r={preview ? 80 : 850} fill={`url(#${id}-spectrum)`} />
    </g>
  </svg>
}

export function RainbowTheme() {
  return <div aria-hidden className="theme-scene after-rain-scene" style={{ background: SCENE_SURFACES.rainbow }}>
    <RefractedLight /><div className="after-rain-sun" /><div className="after-rain-haze" />
  </div>
}

export function RainbowPreview() {
  return <div className="theme-scene theme-preview after-rain-scene" style={{ background: SCENE_SURFACES.rainbow }}><RefractedLight preview /></div>
}
