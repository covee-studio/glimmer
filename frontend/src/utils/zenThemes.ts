import { SCENE_SURFACES } from '../components/zen/sceneSurfaces'
import type { FC } from 'react'
import '../components/zen/theme-scenes.css'
import '../components/zen/nature-scenes.css'
import '../components/zen/seasonal-scenes.css'
import { WavesTheme, WavesPreview } from '../components/zen/WavesTheme'
import { MistTheme, MistPreview } from '../components/zen/MistTheme'
import { ConstellationTheme, ConstellationPreview } from '../components/zen/ConstellationTheme'
import { PaperTheme } from '../components/zen/PaperTheme'
import { BambooTheme, BambooPreview } from '../components/zen/BambooTheme'
import { SolarTheme, SolarPreview } from '../components/zen/SolarTheme'
import { FirefliesTheme, FirefliesPreview } from '../components/zen/FirefliesTheme'
import { MapleTheme, MaplePreview } from '../components/zen/MapleTheme'
import { SakuraTheme, SakuraPreview } from '../components/zen/SakuraTheme'

export const RANDOM_THEME_HISTORY_KEY = 'zen-random-theme-history'
/** How many recent random picks a new Random tab avoids repeating. */
export const RANDOM_THEME_HISTORY_SIZE = 5

/** Recently picked Random themes, newest first. */
export function readRandomThemeHistory(): string[] {
  try {
    const raw = localStorage.getItem(RANDOM_THEME_HISTORY_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

/** A uniform pick from every theme missing from the recent history, so
 *  consecutive Random tabs stop repeating the same backdrop. */
export function pickRandomThemeId(history: string[], random: () => number = Math.random): string {
  const candidates = ZEN_THEMES.filter((theme) => !history.includes(theme.id))
  const pool = candidates.length > 0 ? candidates : ZEN_THEMES
  return pool[Math.floor(random() * pool.length)].id
}

/** Record a Random pick, keeping only the most recent few. */
export function recordRandomTheme(id: string): void {
  try {
    const history = readRandomThemeHistory()
    localStorage.setItem(RANDOM_THEME_HISTORY_KEY, JSON.stringify([id, ...history.filter((entry) => entry !== id)].slice(0, RANDOM_THEME_HISTORY_SIZE)))
  } catch { /* Variety is a nicety, not a guarantee. */ }
}

export interface ZenTheme {
  id: string
  name: string
  surface: string
  swatch?: string
  Preview?: FC
  Backdrop: FC
  dark?: boolean
}

/**
 * Retired theme ids mapped to the theme that inherited their identity, so a
 * saved or migrated selection keeps its spirit instead of falling back to the
 * first theme. Mountains dissolved into Mist, After rain into Solar, Ocean
 * into Waves; Ripples, Snow and Campfire were cut and point at their closest
 * reading companion.
 */
export const RETIRED_THEME_MIGRATION: Record<string, string> = {
  aurora: 'fireflies',
  dawn: 'solar',
  sunrise: 'solar',
  rainbow: 'solar',
  mountains: 'mist',
  ocean: 'waves',
  ripples: 'waves',
  snow: 'mist',
  campfire: 'fireflies',
}

export const ZEN_THEMES: ZenTheme[] = [
  {
    id: 'waves',
    name: 'Waves',
    surface: 'linear-gradient(180deg, #f8f7f4 0%, #f3f2ee 55%, #ecebe7 100%)',
    Preview: WavesPreview,
    Backdrop: WavesTheme,
  },
  {
    id: 'paper',
    name: 'Paper',
    surface: '#faf8f3',
    swatch: '#f6f1e7',
    Backdrop: PaperTheme,
  },
  {
    id: 'mist',
    name: 'Mist',
    surface: SCENE_SURFACES.mist,
    Preview: MistPreview,
    Backdrop: MistTheme,
  },
  {
    id: 'solar',
    name: 'Solar',
    surface: 'linear-gradient(180deg, #c9def4 0%, #f2f7f6 72%, #dce9ed 100%)',
    Preview: SolarPreview,
    Backdrop: SolarTheme,
  },
  {
    id: 'bamboo',
    name: 'Bamboo',
    surface: SCENE_SURFACES.bamboo,
    Preview: BambooPreview,
    Backdrop: BambooTheme,
  },
  {
    id: 'sakura',
    name: 'Sakura',
    surface: SCENE_SURFACES.sakura,
    Preview: SakuraPreview,
    Backdrop: SakuraTheme,
  },
  {
    id: 'maple',
    name: 'Maple',
    surface: SCENE_SURFACES.maple,
    Preview: MaplePreview,
    Backdrop: MapleTheme,
  },
  {
    id: 'constellation',
    name: 'Stars',
    surface: 'linear-gradient(180deg, #0e1320 0%, #1b2236 50%, #161a28 100%)',
    Preview: ConstellationPreview,
    Backdrop: ConstellationTheme,
    dark: true,
  },
  {
    id: 'fireflies',
    name: 'Fireflies',
    surface: 'linear-gradient(180deg, #0d1a15 0%, #14251c 55%, #0a1410 100%)',
    Preview: FirefliesPreview,
    Backdrop: FirefliesTheme,
    dark: true,
  },
]
