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
import { AuroraTheme, AuroraPreview } from '../components/zen/AuroraTheme'
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
    id: 'ripples',
    name: 'Ripples',
    surface: '#eef2f0',
    Preview: RipplesPreview,
    Backdrop: RipplesTheme,
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
    id: 'constellation',
    name: 'Stars',
    surface: 'linear-gradient(180deg, #0e1320 0%, #1b2236 50%, #161a28 100%)',
    Preview: ConstellationPreview,
    Backdrop: ConstellationTheme,
    dark: true,
  },
  {
    id: 'paper',
    name: 'Paper',
    surface: '#faf8f3',
    swatch: '#f6f1e7',
    Backdrop: PaperTheme,
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
    id: 'ocean',
    name: 'Ocean',
    surface: 'linear-gradient(180deg, #e7eef0 0%, #aec6c5 100%)',
    Preview: OceanPreview,
    Backdrop: OceanTheme,
  },
  {
    id: 'rainbow',
    name: 'After rain',
    surface: 'linear-gradient(160deg, #e8f2f3, #f6f8f0 65%, #e1eeee)',
    Preview: RainbowPreview,
    Backdrop: RainbowTheme,
  },
  {
    id: 'snow',
    name: 'Snow',
    surface: 'linear-gradient(180deg, #e8edf1 0%, #eef1f3 100%)',
    Preview: SnowPreview,
    Backdrop: SnowTheme,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    surface: 'linear-gradient(180deg, #060a14 0%, #0a1220 45%, #0d1522 100%)',
    Preview: AuroraPreview,
    Backdrop: AuroraTheme,
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
    id: 'maple',
    name: 'Maple',
    surface: 'linear-gradient(180deg, #f2e4d8 0%, #ede0cc 55%, #e6d0ac 100%)',
    Preview: MaplePreview,
    Backdrop: MapleTheme,
  },
  {
    id: 'sakura',
    name: 'Sakura',
    surface: 'linear-gradient(180deg, #f8ecee 0%, #f9f1ee 45%, #f4e2df 100%)',
    Preview: SakuraPreview,
    Backdrop: SakuraTheme,
  },
  {
    id: 'campfire',
    name: 'Campfire',
    surface: 'linear-gradient(180deg, #252a31, #302b29 62%, #3a2e28)',
    Preview: CampfirePreview,
    Backdrop: CampfireTheme,
    dark: true,
  },
]
