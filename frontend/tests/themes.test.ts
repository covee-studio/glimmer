import { createElement, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { sceneRandom, starParticles, terrainHeight, waveY } from '../src/components/zen/sceneGeometry'
import { BambooTheme } from '../src/components/zen/BambooTheme'
import { ContoursTheme } from '../src/components/zen/ContoursTheme'
import { MoonTheme, MoonPreview } from '../src/components/zen/MoonTheme'
import { MountainsTheme, MountainsPreview } from '../src/components/zen/MountainsTheme'
import { WindowTheme, WindowPreview } from '../src/components/zen/WindowTheme'
import { PaperTheme } from '../src/components/zen/PaperTheme'
import { SolarTheme } from '../src/components/zen/SolarTheme'
import { WavesTheme, WavesPreview } from '../src/components/zen/WavesTheme'
import { ZEN_THEMES, RETIRED_THEME_MIGRATION, RANDOM_THEME_HISTORY_SIZE, pickRandomThemeId, readRandomThemeHistory, recordRandomTheme } from '../src/utils/zenThemes'
import { FirefliesTheme } from '../src/components/zen/FirefliesTheme'
import { SakuraTheme } from '../src/components/zen/SakuraTheme'

it('avoids recently used themes when picking at random', () => {
  const history = ZEN_THEMES.slice(0, RANDOM_THEME_HISTORY_SIZE).map(theme => theme.id)
  for (let i = 0; i < 50; i++) {
    expect(history).not.toContain(pickRandomThemeId(history))
  }
})

it('falls back to the full theme list when every theme was used recently', () => {
  const all = ZEN_THEMES.map(theme => theme.id)
  for (let i = 0; i < 50; i++) {
    expect(all).toContain(pickRandomThemeId(all))
  }
})

it('records random picks capped at the recent window, newest first', () => {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  })
  try {
    for (const theme of ZEN_THEMES) recordRandomTheme(theme.id)
    recordRandomTheme(ZEN_THEMES[0].id)
    const history = readRandomThemeHistory()
    expect(history).toHaveLength(RANDOM_THEME_HISTORY_SIZE)
    expect(history[0]).toBe(ZEN_THEMES[0].id)
    expect(new Set(history).size).toBe(RANDOM_THEME_HISTORY_SIZE)
  } finally {
    vi.unstubAllGlobals()
  }
})

it('keeps scene randomness repeatable and bounded', () => {
  const a = sceneRandom(123), b = sceneRandom(123)
  for (let i = 0; i < 100; i++) {
    const value = a()
    expect(value).toBe(b())
    expect(value).toBeGreaterThanOrEqual(0)
    expect(value).toBeLessThan(1)
  }
})

it('places stars within the scene with varied sizes and brightness', () => {
  const stars = starParticles(96)
  expect(stars).toHaveLength(96)
  expect(stars.every(s => s.x >= 0 && s.x < 100 && s.y >= 0 && s.y < 100)).toBe(true)
  expect(stars.every(s => s.opacity > 0 && s.opacity <= 1)).toBe(true)
  expect(new Set(stars.map(s => s.size)).size).toBeGreaterThan(80)
})

it('does not collide SVG gradient or mask IDs between thumbnails and full scenes', () => {
  const html = renderToStaticMarkup(createElement(Fragment, null,
    createElement(MountainsTheme), createElement(MountainsPreview), createElement(MountainsTheme),
    createElement(WindowTheme), createElement(WindowPreview), createElement(WindowTheme),
    createElement(MoonTheme), createElement(MoonPreview), createElement(MoonTheme),
    createElement(SakuraTheme), createElement(SolarTheme), createElement(SolarTheme)))
  const ids = Array.from(html.matchAll(/ id="([^"]+)"/g), match => match[1])
  expect(ids.length).toBeGreaterThan(10)
  expect(new Set(ids).size).toBe(ids.length)
  for (const [, ref] of html.matchAll(/url\(#([^)]+)\)/g)) expect(ids).toContain(ref)
})

it('renders decorative scenes without interactive or external content', () => {
  for (const Component of [WavesTheme, PaperTheme, MountainsTheme, WindowTheme, ContoursTheme, MoonTheme, SolarTheme, BambooTheme, SakuraTheme, FirefliesTheme]) {
    const html = renderToStaticMarkup(createElement(Component))
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toMatch(/<(button|a|iframe|img)\b/)
    // Embedded SVG grain includes an XML namespace, which is not a request.
    expect(html.replaceAll('http://www.w3.org/2000/svg', '')).not.toMatch(/https?:\/\//)
  }
})

it('keeps particle layouts stable across repeated mounts', () => {
  for (const Component of [FirefliesTheme, SakuraTheme, WindowTheme, MoonTheme, MountainsTheme]) {
    const first = renderToStaticMarkup(createElement(Component))
    expect(renderToStaticMarkup(createElement(Component))).toBe(first)
    expect(first).not.toMatch(/NaN|Infinity/)
  }
})

it('keeps the roster at the expanded set, with retired ids only in the migration map', () => {
  expect(ZEN_THEMES.map(theme => theme.id)).toEqual(['waves', 'mountains', 'window', 'contours', 'moon', 'paper', 'solar', 'bamboo', 'sakura', 'fireflies'])
  expect(new Set(ZEN_THEMES.map(theme => theme.id)).size).toBe(ZEN_THEMES.length)
  expect(ZEN_THEMES.filter(theme => theme.dark).map(theme => theme.id)).toEqual(['moon', 'fireflies'])
  const retired = ['aurora', 'sunrise-sea', 'stream', 'zengarden', 'rainbow', 'ocean', 'ripples', 'snow', 'campfire', 'dawn', 'sunrise', 'mist', 'maple', 'constellation']
  expect(ZEN_THEMES.some(theme => retired.includes(theme.id))).toBe(false)
  for (const id of retired.filter(id => !['sunrise-sea', 'stream', 'zengarden'].includes(id))) expect(RETIRED_THEME_MIGRATION[id] ?? 'missing').not.toBe('missing')
  for (const target of Object.values(RETIRED_THEME_MIGRATION)) {
    expect(ZEN_THEMES.some(theme => theme.id === target)).toBe(true)
  }
})

it('keeps Mountains as its own theme: the live ridges with geese in formation', () => {
  expect(ZEN_THEMES.some(theme => theme.id === 'mountains')).toBe(true)
  expect(RETIRED_THEME_MIGRATION).not.toHaveProperty('mountains')
  const html = renderToStaticMarkup(createElement(MountainsTheme))
  expect(html.match(/class="mountain-wing mountain-wing-left"/g)).toHaveLength(16)
  expect(html).not.toContain('mountain-peaks')
  expect(html.match(/<path d="M-40 /g)).toHaveLength(4)
  expect(html).toContain('mountain-flock-far')
})

it('lays out Moon with one reflection axis and stars only at the margins', () => {
  const html = renderToStaticMarkup(createElement(MoonTheme))
  expect(html.match(/class="moon-glint"/g)).toHaveLength(17)
  const stars = Array.from(html.matchAll(/<i style="left:([\d.]+)%/g), match => Number(match[1]))
  expect(stars.length).toBe(16)
  expect(stars.every(left => left < 28 || left > 61)).toBe(true)
})

it('keeps the contour field bounded, repeatable and slowly changing', () => {
  for (let i = 0; i < 200; i++) {
    const value = terrainHeight(i * 7, i * 5, i * .01)
    expect(value).toBeGreaterThanOrEqual(0)
    expect(value).toBeLessThanOrEqual(1)
  }
  expect(terrainHeight(300, 200, .4)).toBe(terrainHeight(300, 200, .4))
  expect(Math.abs(terrainHeight(300, 200, .4) - terrainHeight(300, 200, .401))).toBeLessThan(.01)
})

it('scales wave relief with the canvas and keeps layers vertically alive', () => {
  const layer = { color: '#fff', speed: 0.3, amplitude: 0.08, phase: 0.2, baseY: 0.4, frequency: 1.1, direction: 1 } as const
  const small = waveY(layer, 0.3, 200, 1.5) - layer.baseY * 200
  const large = waveY(layer, 0.3, 400, 1.5) - layer.baseY * 400
  expect(large).toBeCloseTo(small * 2)
  expect(waveY(layer, 0.3, 200, 1.5)).not.toBeCloseTo(waveY(layer, 0.3, 200, 3.5))
  expect(waveY(layer, 0.3, 200, 1.5, 1)).not.toBeCloseTo(waveY(layer, 0.3, 200, 1.5, 1.75))
  const normalRelief = waveY(layer, 0.3, 200, 1.5, 1, 1) - layer.baseY * 200
  const desktopRelief = waveY(layer, 0.3, 200, 1.5, 1, 1.4) - layer.baseY * 200
  expect(Math.abs(desktopRelief)).toBeGreaterThan(Math.abs(normalRelief))
})

it('uses artwork without a center marker for the waves preview', () => {
  const html = renderToStaticMarkup(createElement(WavesPreview))
  expect(html.match(/<path/g)).toHaveLength(6)
  expect(html).not.toMatch(/<(circle|ellipse)\b/)
})

it('uses the registered opaque surface for refined scenes and their thumbnails', () => {
  for (const id of ['sakura', 'bamboo']) {
    const theme = ZEN_THEMES.find(candidate => candidate.id === id)!
    for (const Component of [theme.Backdrop, theme.Preview!]) {
      const html = renderToStaticMarkup(createElement(Component))
      expect(html).toContain(`style="background:${theme.surface}"`)
    }
  }
})
