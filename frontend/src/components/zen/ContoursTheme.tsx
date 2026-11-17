import { useEffect, useRef } from 'react'
import { terrainHeight } from './sceneGeometry'

// Terrain drawn as lines only. A slow value-noise field is cut into contour
// levels with marching squares; every fifth level is an index line, as on a
// survey map. The field drifts so slowly that it reads as geology, not motion.
const LEVELS = 11
const CELL = 9
const INDEX_EVERY = 5

function draw(ctx: CanvasRenderingContext2D, width: number, height: number, t: number, unit = 1) {
  ctx.clearRect(0, 0, width, height)
  const cols = Math.ceil(width / CELL), rows = Math.ceil(height / CELL)
  const field = new Float32Array((cols + 1) * (rows + 1))
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) field[j * (cols + 1) + i] = terrainHeight(i * CELL, j * CELL, t)
  ctx.lineCap = 'round'
  for (let level = 0; level < LEVELS; level++) {
    const iso = .25 + (level / (LEVELS - 1)) * .5
    const index = level % INDEX_EVERY === 0
    ctx.beginPath()
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const k = j * (cols + 1) + i
      const a = field[k], b = field[k + 1], c = field[k + 1 + cols + 1], d = field[k + cols + 1]
      let mask = 0
      if (a > iso) mask |= 1
      if (b > iso) mask |= 2
      if (c > iso) mask |= 4
      if (d > iso) mask |= 8
      if (mask === 0 || mask === 15) continue
      const x = i * CELL, y = j * CELL
      const top = [x + CELL * (iso - a) / (b - a), y]
      const right = [x + CELL, y + CELL * (iso - b) / (c - b)]
      const bottom = [x + CELL * (iso - d) / (c - d), y + CELL]
      const left = [x, y + CELL * (iso - a) / (d - a)]
      const seg = (p: number[], q: number[]) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]) }
      switch (mask) {
        case 1: case 14: seg(left, top); break
        case 2: case 13: seg(top, right); break
        case 3: case 12: seg(left, right); break
        case 4: case 11: seg(right, bottom); break
        case 6: case 9: seg(top, bottom); break
        case 7: case 8: seg(left, bottom); break
        case 5: seg(left, top); seg(right, bottom); break
        case 10: seg(top, right); seg(left, bottom); break
      }
    }
    ctx.strokeStyle = index ? 'rgba(88, 112, 118, .38)' : 'rgba(104, 128, 133, .19)'
    ctx.lineWidth = (index ? 1.25 : .8) * unit
    ctx.stroke()
  }
}

export function ContoursTheme() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0, height = 0, raf = 0, elapsed = 18, previous: number | undefined, sinceDraw = 1
    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.round(canvas.clientWidth)), h = Math.max(1, Math.round(canvas.clientHeight))
      if (w !== width || h !== height || canvas.width !== w * dpr) {
        width = w; height = h
        canvas.width = w * dpr; canvas.height = h * dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      draw(ctx, width, height, elapsed * .012)
    }
    const frame = (now: number) => {
      if (previous !== undefined) {
        const dt = Math.min((now - previous) / 1000, .1)
        elapsed += dt
        sinceDraw += dt
      }
      previous = now
      if (sinceDraw >= 1 / 20) { sinceDraw = 0; render() }
      raf = requestAnimationFrame(frame)
    }
    const start = () => {
      cancelAnimationFrame(raf)
      previous = undefined
      render()
      if (!document.hidden && !reducedMotion.matches) raf = requestAnimationFrame(frame)
    }
    const observer = new ResizeObserver(render)
    observer.observe(canvas)
    document.addEventListener('visibilitychange', start)
    reducedMotion.addEventListener('change', start)
    start()
    return () => {
      cancelAnimationFrame(raf); observer.disconnect()
      document.removeEventListener('visibilitychange', start)
      reducedMotion.removeEventListener('change', start)
    }
  }, [])
  return <div aria-hidden className="theme-scene contours-scene"><canvas ref={canvasRef} className="contours-canvas" /></div>
}

export function ContoursPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const w = Math.max(1, Math.round(canvas.clientWidth)), h = Math.max(1, Math.round(canvas.clientHeight))
    canvas.width = w; canvas.height = h
    ctx.scale(w / 320, w / 320)
    draw(ctx, 320, 320 * h / w, 0.22, 2.6)
  }, [])
  return <div aria-hidden className="theme-scene theme-preview contours-scene"><canvas ref={canvasRef} className="contours-canvas" /></div>
}
