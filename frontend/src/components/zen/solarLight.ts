/** Local-clock art direction, without location access or a sunrise service. */
const KEYFRAMES = [
  { hour: 0, name: 'night', sky: ['#8fa7c6', '#bbcee3', '#dbe5f1', '#c5d7e9'] },
  { hour: 5, name: 'dawn', sky: ['#cbd9ed', '#e3e7f0', '#f6e9e2', '#f3d9c2'] },
  { hour: 8, name: 'morning', sky: ['#c9e0ef', '#dfedf5', '#f2f7fa', '#deedf5'] },
  { hour: 12, name: 'noon', sky: ['#b9d9ee', '#d9ecf7', '#eef7fc', '#d9edf7'] },
  { hour: 15, name: 'afternoon', sky: ['#cddfea', '#e5eef4', '#f7f6f1', '#eae9df'] },
  { hour: 18, name: 'dusk', sky: ['#cbd2e6', '#e3dfed', '#f4e1dc', '#efcdb2'] },
  { hour: 21, name: 'evening', sky: ['#bdcce3', '#d5dfed', '#e9e9f2', '#e5dce8'] },
  { hour: 24, name: 'night', sky: ['#8fa7c6', '#bbcee3', '#dbe5f1', '#c5d7e9'] },
] as const

export interface SolarLight { name: string; sky: string[] }
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
  return { name: from.name, sky: from.sky.map((color, i) => mixColor(color, to.sky[i], progress)) }
}

export function solarBackground(light: SolarLight): string {
  return `linear-gradient(180deg, ${light.sky[0]} 0%, ${light.sky[1]} 34%, ${light.sky[2]} 72%, ${light.sky[3]} 100%)`
}
