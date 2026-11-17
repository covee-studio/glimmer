import { createElement, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { sceneRandom, starParticles, waveY } from '../src/components/zen/sceneGeometry'
import { BambooTheme } from '../src/components/zen/BambooTheme'
import { ConstellationTheme } from '../src/components/zen/ConstellationTheme'
import { MistTheme, MistPreview } from '../src/components/zen/MistTheme'
import { PaperTheme } from '../src/components/zen/PaperTheme'
import { SolarTheme } from '../src/components/zen/SolarTheme'
import { WavesTheme, WavesPreview } from '../src/components/zen/WavesTheme'
import { ZEN_THEMES, RETIRED_THEME_MIGRATION, RANDOM_THEME_HISTORY_SIZE, pickRandomThemeId, readRandomThemeHistory, recordRandomTheme } from '../src/utils/zenThemes'
import { FirefliesTheme } from '../src/components/zen/FirefliesTheme'
import { MapleTheme, MaplePreview } from '../src/components/zen/MapleTheme'
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
    createElement(MistTheme), createElement(MistPreview), createElement(MistTheme),
    createElement(MapleTheme), createElement(MaplePreview), createElement(MapleTheme),
    createElement(SakuraTheme), createElement(SolarTheme), createElement(SolarTheme)))
  const ids = Array.from(html.matchAll(/ id="([^"]+)"/g), match => match[1])
  expect(ids.length).toBeGreaterThan(10)
  expect(new Set(ids).size).toBe(ids.length)
  for (const [, ref] of html.matchAll(/url\(#([^)]+)\)/g)) expect(ids).toContain(ref)
})

it('renders decorative scenes without interactive or external content', () => {
  for (const Component of [WavesTheme, PaperTheme, MistTheme, SolarTheme, BambooTheme, SakuraTheme, MapleTheme, ConstellationTheme, FirefliesTheme]) {
    const html = renderToStaticMarkup(createElement(Component))
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toMatch(/<(button|a|iframe|img)\b/)
    // Embedded SVG grain includes an XML namespace, which is not a request.
    expect(html.replaceAll('http://www.w3.org/2000/svg', '')).not.toMatch(/https?:\/\//)
  }
})

it('keeps particle layouts stable across repeated mounts', () => {
  for (const Component of [FirefliesTheme, MapleTheme, SakuraTheme]) {
    const first = renderToStaticMarkup(createElement(Component))
    expect(renderToStaticMarkup(createElement(Component))).toBe(first)
    expect(first).not.toMatch(/NaN|Infinity/)
  }
})

it('keeps the roster at the consolidated set, with retired ids only in the migration map', () => {
  expect(ZEN_THEMES).toHaveLength(9)
  expect(new Set(ZEN_THEMES.map(theme => theme.id)).size).toBe(ZEN_THEMES.length)
  expect(ZEN_THEMES.filter(theme => theme.dark)).toHaveLength(2)
  const retired = ['aurora', 'sunrise-sea', 'stream', 'zengarden', 'rainbow', 'mountains', 'ocean', 'ripples', 'snow', 'campfire', 'dawn', 'sunrise']
  expect(ZEN_THEMES.some(theme => retired.includes(theme.id))).toBe(false)
  for (const target of Object.values(RETIRED_THEME_MIGRATION)) {
    expect(ZEN_THEMES.some(theme => theme.id === target)).toBe(true)
  }
})

it('starts the flock in flight and schedules the first meteor within one second', () => {
  const mist = renderToStaticMarkup(createElement(MistTheme))
  const stars = renderToStaticMarkup(createElement(ConstellationTheme))
  expect(mist).toContain('animation-delay:-7s')
  const firstMeteor = stars.match(/class="scene-meteor" style="([^"]+)"/)?.[1]
  expect(firstMeteor).toContain('animation-delay:0.35s')
})

it('uses a bounded meteor set, with no runtime accumulation', () => {
  const stars = renderToStaticMarkup(createElement(ConstellationTheme))
  expect(stars.match(/class="scene-meteor"/g)).toHaveLength(3)
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
  for (const id of ['maple', 'sakura', 'mist', 'bamboo']) {
    const theme = ZEN_THEMES.find(candidate => candidate.id === id)!
    for (const Component of [theme.Backdrop, theme.Preview!]) {
      const html = renderToStaticMarkup(createElement(Component))
      expect(html).toContain(`style="background:${theme.surface}"`)
    }
  }
})
