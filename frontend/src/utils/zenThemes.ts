import { SCENE_SURFACES } from '../components/zen/sceneSurfaces'
import type { FC } from 'react'
import '../components/zen/theme-scenes.css'
import '../components/zen/nature-scenes.css'
import '../components/zen/seasonal-scenes.css'
import { WavesTheme, WavesPreview } from '../components/zen/WavesTheme'
import { MistTheme, MistPreview } from '../components/zen/MistTheme'
import { ConstellationTheme, ConstellationPreview } from '../components/zen/ConstellationTheme'
import { PaperTheme } from '../components/zen/PaperTheme'
import { RipplesTheme, RipplesPreview } from '../components/zen/RipplesTheme'
import { MountainsTheme, MountainsPreview } from '../components/zen/MountainsTheme'
import { BambooTheme, BambooPreview } from '../components/zen/BambooTheme'
import { OceanTheme, OceanPreview } from '../components/zen/OceanTheme'
import { RainbowTheme, RainbowPreview } from '../components/zen/RainbowTheme'
import { SolarTheme, SolarPreview } from '../components/zen/SolarTheme'
import { SnowTheme, SnowPreview } from '../components/zen/SnowTheme'
import { FirefliesTheme, FirefliesPreview } from '../components/zen/FirefliesTheme'
import { MapleTheme, MaplePreview } from '../components/zen/MapleTheme'
import { SakuraTheme, SakuraPreview } from '../components/zen/SakuraTheme'

import { CampfireTheme, CampfirePreview } from '../components/zen/CampfireTheme'

export interface ZenTheme {
  id: string
  name: string
  surface: string
  swatch?: string
  Preview?: FC
  Backdrop: FC
  dark?: boolean
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
    surface: '#f5f5f4',
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
    id: 'rainbow',
    name: 'After rain',
    surface: SCENE_SURFACES.rainbow,
    Preview: RainbowPreview,
    Backdrop: RainbowTheme,
  },
  {
    id: 'ripples',
    name: 'Ripples',
    surface: SCENE_SURFACES.ripples,
    Preview: RipplesPreview,
    Backdrop: RipplesTheme,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    surface: 'linear-gradient(180deg, #e7eef0 0%, #aec6c5 100%)',
    Preview: OceanPreview,
    Backdrop: OceanTheme,
  },
  {
    id: 'mountains',
    name: 'Mountains',
    surface: 'linear-gradient(180deg, #f3ede0 0%, #e9e1cf 100%)',
    Preview: MountainsPreview,
    Backdrop: MountainsTheme,
  },
  {
    id: 'bamboo',
    name: 'Bamboo',
    surface: 'linear-gradient(180deg, #d9e0dc 0%, #dbe2dd 100%)',
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
    id: 'snow',
    name: 'Snow',
    surface: 'linear-gradient(180deg, #e8edf1 0%, #eef1f3 100%)',
    Preview: SnowPreview,
    Backdrop: SnowTheme,
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
  {
    id: 'campfire',
    name: 'Campfire',
    surface: SCENE_SURFACES.campfire,
    Preview: CampfirePreview,
    Backdrop: CampfireTheme,
    dark: true,
  },
]
