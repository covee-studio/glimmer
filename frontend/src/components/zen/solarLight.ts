/** Local-clock art direction, without location access or a sunrise service. */
const KEYFRAMES = [
  { hour: 0, name: 'night', horizonStart: 76, glowHeight: 35, glowOpacity: .1, skyLight: .15, sky: ['#8fa7c6', '#bbcee3', '#dbe5f1', '#c5d7e9'] },
  { hour: 5, name: 'dawn', horizonStart: 62, glowHeight: 70, glowOpacity: .45, skyLight: .7, sky: ['#cbd9ed', '#e3e7f0', '#f6e9e2', '#f3d9c2'] },
  { hour: 8, name: 'morning', horizonStart: 70, glowHeight: 85, glowOpacity: .2, skyLight: .9, sky: ['#c9e0ef', '#dfedf5', '#f2f7fa', '#deedf5'] },
  { hour: 12, name: 'noon', horizonStart: 72, glowHeight: 85, glowOpacity: .15, skyLight: 1, sky: ['#b9d9ee', '#d9ecf7', '#eef7fc', '#d9edf7'] },
  { hour: 15, name: 'afternoon', horizonStart: 74, glowHeight: 60, glowOpacity: .25, skyLight: .7, sky: ['#cddfea', '#e5eef4', '#f7f6f1', '#eae9df'] },
  { hour: 18, name: 'dusk', horizonStart: 85, glowHeight: 23, glowOpacity: .65, skyLight: .15, sky: ['#879fbd', '#c4cce0', '#e9cbd0', '#efb487'] },
  { hour: 21, name: 'evening', horizonStart: 80, glowHeight: 28, glowOpacity: .15, skyLight: .2, sky: ['#bdcce3', '#d5dfed', '#e9e9f2', '#e5dce8'] },
  { hour: 24, name: 'night', horizonStart: 76, glowHeight: 35, glowOpacity: .1, skyLight: .15, sky: ['#8fa7c6', '#bbcee3', '#dbe5f1', '#c5d7e9'] },
] as const

export interface SolarLight {
  name: string
  sky: string[]
  horizonStart: number
  glowHeight: number
  glowOpacity: number
  skyLight: number
}
function mixColor(from: string, to: string, progress: number): string {
  const channels = [1, 3, 5].map(offset => Math.round(
    parseInt(from.slice(offset, offset + 2), 16) * (1 - progress)
    + parseInt(to.slice(offset, offset + 2), 16) * progress,
  ).toString(16).padStart(2, '0'))
  return `#${channels.join('')}`
}

export function solarLightAt(hour: number): SolarLight {
  const time = ((hour % 24) + 24) % 24
  const index = KEYFRAMES.findIndex((frame, i) => i < KEYFRAMES.length - 1 && time >= frame.hour && time < KEYFRAMES[i + 1].hour)
  const from = KEYFRAMES[index]
  const to = KEYFRAMES[index + 1]
  const fraction = (time - from.hour) / (to.hour - from.hour)
  const progress = fraction * fraction * (3 - 2 * fraction)
  const mix = (a: number, b: number) => a + (b - a) * progress
  return {
    name: from.name,
    sky: from.sky.map((color, i) => mixColor(color, to.sky[i], progress)),
    horizonStart: mix(from.horizonStart, to.horizonStart),
    glowHeight: mix(from.glowHeight, to.glowHeight),
    glowOpacity: mix(from.glowOpacity, to.glowOpacity),
    skyLight: mix(from.skyLight, to.skyLight),
  }
}

export function solarBackground(light: SolarLight): string {
  return `linear-gradient(180deg, ${light.sky[0]} 0%, ${light.sky[1]} 34%, ${light.sky[2]} ${light.horizonStart}%, ${light.sky[3]} 100%)`
}
