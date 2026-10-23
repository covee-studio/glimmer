import { useId } from 'react'
import { SCENE_SURFACES } from './sceneSurfaces'

/** Soft folded banks give the fog volume; the layers occlude one another. */
function MistVolume({ foreground = false }: { foreground?: boolean }) {
  const id = useId()
  return <svg className={`mist-volume ${foreground ? 'mist-volume-near' : 'mist-volume-far'}`}
    viewBox="0 0 1440 700" preserveAspectRatio="none">
    <defs>
      <linearGradient id={`${id}-body`} x1="0" y1="0" x2=".25" y2="1">
        <stop stopColor={foreground ? '#ffffff' : '#789bb8'} stopOpacity={foreground ? '.94' : '.62'} />
        <stop offset=".48" stopColor={foreground ? '#d9e8f3' : '#b4cddd'} stopOpacity=".78" />
        <stop offset="1" stopColor={foreground ? '#89aac2' : '#eaf2f7'} stopOpacity={foreground ? ".3" : ".12"} />
      </linearGradient>
      <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2=".6">
        <stop stopColor="white" stopOpacity=".05" />
        <stop offset=".4" stopColor="white" stopOpacity=".65" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d={foreground
      ? 'M-120,290 C80,165 260,390 490,265 C670,165 780,85 980,155 C1190,240 1320,65 1560,125 L1560,760 L-120,760Z'
      : 'M-120,-60H1560V340 C1320,470 1160,185 920,270 C690,355 620,520 380,405 C170,310 30,475 -120,410Z'} fill={`url(#${id}-body)`} />
    <path d={foreground
      ? 'M-120,375 C160,225 290,470 535,315 C770,170 855,240 1050,225 C1280,205 1340,140 1560,220 L1560,760H-120Z'
      : 'M-120,-60H1560V225 C1270,375 1130,120 890,220 C660,320 570,405 360,325 C135,235 40,385 -120,340Z'} fill={`url(#${id}-edge)`} />
  </svg>
}
function MistAtmosphere() {
  return <>
    <MistVolume />
    <div className="mist-sunbeam" />
    <MistVolume foreground />
    <div className="mist-reading-light" />
  </>
}
export function MistTheme() {
  return <div aria-hidden className="theme-scene mist-scene" style={{ background: SCENE_SURFACES.mist }}><MistAtmosphere /></div>
}
export function MistPreview() {
  return <div aria-hidden className="theme-scene theme-preview mist-scene" style={{ background: SCENE_SURFACES.mist }}><MistAtmosphere /></div>
}
