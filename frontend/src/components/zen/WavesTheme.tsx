import { useEffect, useRef } from "react"
import { waveY, sceneRandom } from "./sceneGeometry"

const LAYERS = [
  { color: "#d9e4de", speed: 0.34, amplitude: 0.080, phase: 0.2, baseY: 0.18, frequency: 1.15, direction: 1 },
  { color: "#c5d4cc", speed: 0.27, amplitude: 0.096, phase: 1.4, baseY: 0.35, frequency: 1.05, direction: -1 },
  { color: "#afc1b8", speed: 0.22, amplitude: 0.105, phase: 2.7, baseY: 0.52, frequency: 0.92, direction: 1 },
  { color: "#98aca2", speed: 0.17, amplitude: 0.092, phase: 4.0, baseY: 0.68, frequency: 1.08, direction: -1 },
  { color: "#81968c", speed: 0.13, amplitude: 0.078, phase: 5.2, baseY: 0.82, frequency: 0.86, direction: 1 },
] as const

// Light glints inherited from the retired Ocean theme: short reflections that
// ride the two front wave crests instead of a separate sea, so the shimmer
// follows the same motion as the water. The sailboat stays out — the scene
// keeps its abstract reading-first language.
const random = sceneRandom(517)
const GLINTS = Array.from({ length: 42 }, () => ({
  layer: 2 + Math.floor(random() * 3),
  x: random(),
  length: 12 + random() * 40,
  opacity: .2 + random() * .35,
  twinkle: .5 + random() * .9,
  phase: random() * Math.PI * 2,
}))

function drawWaves(ctx: CanvasRenderingContext2D, width: number, height: number, elapsed: number) {
  ctx.clearRect(0, 0, width, height)
  for (const layer of LAYERS) {
    ctx.beginPath()
    ctx.moveTo(0, height)
    const step = Math.max(2, width / 240)
    const spatialScale = Math.min(1.75, Math.max(1, width / 700))
    const reliefScale = 1 + Math.min(0.48, Math.max(0, (width - 640) / 1340))
    for (let x = 0; x <= width + step; x += step) {
      ctx.lineTo(x, waveY(layer, x / width, height, elapsed, spatialScale, reliefScale))
    }
    ctx.lineTo(width, height)
    ctx.closePath()
    ctx.fillStyle = layer.color
    ctx.fill()
  }
}

function drawGlints(ctx: CanvasRenderingContext2D, width: number, height: number, elapsed: number) {
  const spatialScale = Math.min(1.75, Math.max(1, width / 700))
  const reliefScale = 1 + Math.min(0.48, Math.max(0, (width - 640) / 1340))
  ctx.lineCap = "round"
  for (const glint of GLINTS) {
    const layer = LAYERS[glint.layer]
    const crest = waveY(layer, glint.x, height, elapsed, spatialScale, reliefScale)
    const slope = (waveY(layer, Math.min(1, glint.x + 0.01), height, elapsed, spatialScale, reliefScale) - crest) / (width * 0.01)
    if (slope > 0.95) continue // glints live on the lit, near-horizontal shoulder of a crest
    const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(elapsed * glint.twinkle * 1.6 + glint.phase))
    const length = glint.length * Math.min(1.6, Math.max(0.8, width / 900))
    ctx.beginPath()
    ctx.moveTo(glint.x * width - length / 2, crest - 1.5)
    ctx.quadraticCurveTo(glint.x * width, crest - 2.5 - Math.abs(slope) * 2, glint.x * width + length / 2, crest - 1.5 + slope * length * 0.35)
    ctx.strokeStyle = `rgba(249, 255, 252, ${(glint.opacity * twinkle).toFixed(3)})`
    ctx.lineWidth = 1.25
    ctx.stroke()
  }
}

export function WavesTheme() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let width = 0
    let height = 0
    let animationId = 0
    let elapsed = 0
    let previousTime: number | undefined

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const nextWidth = Math.max(1, Math.round(canvas.clientWidth))
      const nextHeight = Math.max(1, Math.round(canvas.clientHeight))
      if (nextWidth !== width || nextHeight !== height || canvas.width !== nextWidth * dpr || canvas.height !== nextHeight * dpr) {
        width = nextWidth
        height = nextHeight
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      drawWaves(ctx, width, height, elapsed)
      drawGlints(ctx, width, height, elapsed)
    }

    const frame = (now: number) => {
      if (previousTime !== undefined) elapsed += Math.min((now - previousTime) / 1000, 0.05)
      previousTime = now
      render()
      animationId = requestAnimationFrame(frame)
    }

    const start = () => {
      cancelAnimationFrame(animationId)
      previousTime = undefined
      render()
      if (!document.hidden && !reducedMotion.matches) animationId = requestAnimationFrame(frame)
    }

    const resizeObserver = new ResizeObserver(render)
    resizeObserver.observe(canvas)
    document.addEventListener("visibilitychange", start)
    reducedMotion.addEventListener("change", start)
    start()

    return () => {
      cancelAnimationFrame(animationId)
      resizeObserver.disconnect()
      document.removeEventListener("visibilitychange", start)
      reducedMotion.removeEventListener("change", start)
    }
  }, [])

  return <div aria-hidden className="theme-scene waves-scene"><div className="waves-light" /><canvas ref={canvasRef} className="waves-canvas" /></div>
}

export function WavesPreview() {
  return <div aria-hidden className="theme-scene theme-preview waves-scene">
    <svg className="waves-preview-art" viewBox="0 0 100 48" preserveAspectRatio="none">
      <path fill="#dfe8e3" d="M0 29 C17 29 26 19 40 21 S72 33 100 24 V48 H0Z" />
      <path fill="#c8d7cf" d="M0 34 C18 27 30 36 48 31 S73 21 100 35 V48 H0Z" />
      <path fill="#aebfb6" d="M0 41 C18 43 27 31 44 35 S67 43 82 37 S94 35 100 38 V48 H0Z" />
      <g stroke="#f9fffc" strokeWidth=".8" strokeLinecap="round" fill="none" opacity=".7">
        <path d="M18 30q4 -1.2 8 0" />
        <path d="M55 33q5 -1.4 10 0" />
        <path d="M76 27q3.5 -1 7 0" />
      </g>
    </svg>
  </div>
}
