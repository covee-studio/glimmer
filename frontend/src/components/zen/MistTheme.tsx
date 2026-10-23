import { SCENE_SURFACES } from './sceneSurfaces'

function MistVeils() {
  return <>
    <div className="mist-veil mist-veil-distant" />
    <div className="mist-veil mist-veil-near" />
    <div className="mist-reading-light" />
  </>
}
export function MistTheme() {
  return <div aria-hidden className="theme-scene mist-scene" style={{ background: SCENE_SURFACES.mist }}><MistVeils /></div>
}
export function MistPreview() {
  return <div aria-hidden className="theme-scene theme-preview mist-scene" style={{ background: SCENE_SURFACES.mist }}><MistVeils /></div>
}
