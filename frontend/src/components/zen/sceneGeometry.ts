/** Stable layouts avoid rerender jumps and make visual regressions reproducible. */
export function sceneRandom(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0
    return value / 4294967296
  }
}

export function starParticles(count: number) {
  const random = sceneRandom(173)
  return Array.from({ length: count }, (_, i) => ({
    x: random() * 100, y: random() * 100,
    size: i % 9 === 0 ? 2.4 + random() : 0.7 + random() * 1.2,
    opacity: 0.22 + random() * 0.65, duration: 3 + random() * 6,
    delay: -random() * 12,
  }))
}

export interface WaveParameters {
  speed: number
  amplitude: number
  phase: number
  baseY: number
  frequency: number
  direction: number
}

export function waveY(layer: WaveParameters, xRatio: number, height: number, elapsed: number, spatialScale = 1, reliefScale = 1) {
  const travel = elapsed * layer.speed * layer.direction
  const breathing = 0.88 + Math.sin(elapsed * 0.31 + layer.phase) * 0.12
  const amplitude = height * layer.amplitude * breathing * reliefScale
  const rise = Math.sin(elapsed * 0.23 + layer.phase * 1.7) * height * 0.018 * reliefScale
  const broadSwell = Math.sin(xRatio * Math.PI * 2 * layer.frequency * spatialScale + travel + layer.phase)
  const crossingScale = 0.75 + spatialScale * 0.25
  const crossingSwell = Math.sin(xRatio * Math.PI * 2 * 0.54 * crossingScale - travel * 0.62 + layer.phase * 1.35) * 0.48
  const crestDetail = Math.sin(xRatio * Math.PI * 2 * 2.15 * spatialScale + travel * 1.35 + layer.phase * 0.7) * 0.13

  return layer.baseY * height + rise - (broadSwell + crossingSwell + crestDetail) * amplitude
}

function hash(ix: number, iy: number) {
  let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
function smooth(t: number) { return t * t * (3 - 2 * t) }
function noise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = smooth(x - ix), fy = smooth(y - iy)
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1)
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
}
/** Two octaves, normalised to roughly 0..1. `t` slides the field through itself. */
export function terrainHeight(x: number, y: number, t: number) {
  return (noise(x * .0031 + t * .6, y * .0031 + 7.3 - t * .35) * .78 + noise(x * .0078 - t * .9 + 31, y * .0078 + t * .5 + 11) * .22)
}

