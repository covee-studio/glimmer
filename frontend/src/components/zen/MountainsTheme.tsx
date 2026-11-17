import { useId, type CSSProperties } from 'react'

// 青绿山水 structure, abstracted into flat layers: a pale level-distance
// ridge, one mid-distance ridge, a dominant right peak answered by a smaller
// left one (主客分明), mist bands that lock the ranges apart (烟霞锁其腰),
// and a warm ochre ground. Restrained 石青/石绿 mineral tones, deep value
// steps instead of detail, and an empty paper sky for the text.
const FAR_RIDGE =
  'M-40 292 C50 288 110 272 170 268 S270 244 320 252 S430 278 520 274 S660 252 740 258 S880 282 960 276 S1040 224 1086 230 S1200 262 1240 256 V460 H-40Z'

const MID_RIDGE =
  'M-40 316 C70 306 130 288 200 292 S330 266 400 274 S540 300 640 296 S790 270 870 278 S1010 302 1100 296 S1200 284 1240 290 V460 H-40Z'

// The main group: stepped west approach, flat summit plateau, a steep east
// face, then a long tail that sinks into the distance.
const MAIN_GROUP =
  'M-40 460 L-40 336 C60 326 120 306 180 284 L226 236 L252 242 L318 156 L344 162 C390 214 430 238 480 240 L556 176 L580 182 L664 112 L690 118 L762 64 L784 62 L800 74 L826 118 L852 180 L900 226 C966 242 1048 240 1108 250 L1240 272 L1240 460 Z'

// A single 石青 shadow plane on the east face of the summit, the way mineral
// blue cools one side of a 青绿 peak.
const SHADOW_FACET =
  'M800 74 L826 118 L852 180 L900 226 C880 230 860 220 844 196 C828 164 812 116 800 74 Z'

const NEAR_HILLS =
  'M-40 460 L-40 372 C80 362 150 342 230 348 S380 378 470 372 S640 340 740 352 S920 386 1020 376 S1180 362 1240 372 V460 H-40Z'

const FOREGROUND =
  'M-40 460 L-40 420 C140 406 260 424 400 418 S640 400 800 414 S1080 430 1240 414 V460 H-40Z'

function MountainLandscape() {
  const id = useId().replace(/:/g, '')
  return <svg viewBox="0 0 1200 460" preserveAspectRatio="none" className="mountain-landscape">
    <defs>
      <linearGradient id={`${id}-far`} x2="0" y2="1">
        <stop stopColor="#9fb6bd" /><stop offset="1" stopColor="#c6d2cf" />
      </linearGradient>
      <linearGradient id={`${id}-main`} x2="0" y2="1">
        <stop stopColor="#3f6f66" /><stop offset="1" stopColor="#8fa89b" />
      </linearGradient>
      <linearGradient id={`${id}-near`} x2="0" y2="1">
        <stop stopColor="#356052" /><stop offset="1" stopColor="#759181" />
      </linearGradient>
      <linearGradient id={`${id}-fore`} x2="0" y2="1">
        <stop stopColor="#2a4f44" /><stop offset="1" stopColor="#5b7466" />
      </linearGradient>
      <linearGradient id={`${id}-ochre`} x2="0" y2="1">
        <stop stopColor="#8f7a56" stopOpacity="0" /><stop offset="1" stopColor="#96754e" stopOpacity=".3" />
      </linearGradient>
      <filter id={`${id}-soft`} x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="1.6" /></filter>
      <filter id={`${id}-mist`} x="-40%" y="-200%" width="180%" height="500%"><feGaussianBlur stdDeviation="13" /></filter>
    </defs>

    {/* 平远：淡青的低矮远山 */}
    <path className="mountain-far" d={FAR_RIDGE} fill={`url(#${id}-far)`} opacity=".9" filter={`url(#${id}-soft)`} />
    {/* 烟霞一带，隔开了远山 */}
    <ellipse cx="600" cy="258" rx="780" ry="28" fill="#f4f1e6" opacity=".55" filter={`url(#${id}-mist)`} />
    {/* 中景一层，层层叠叠 */}
    <path d={MID_RIDGE} fill="#86a29b" opacity=".55" filter={`url(#${id}-soft)`} />
    {/* 主峰群：主峰在右，次峰在左 */}
    <path d={MAIN_GROUP} fill={`url(#${id}-main)`} />
    <path d={SHADOW_FACET} fill="#41616d" opacity=".35" />
    {/* 烟霞二带，锁主峰之腰 */}
    <ellipse cx="770" cy="166" rx="440" ry="24" fill="#f4f1e6" opacity=".5" filter={`url(#${id}-mist)`} />
    {/* 近景山麓与前景基脚 */}
    <path d={NEAR_HILLS} fill={`url(#${id}-near)`} />
    <path d={FOREGROUND} fill={`url(#${id}-fore)`} />
    {/* 赭石地气 */}
    <rect x="-40" y="360" width="1280" height="100" fill={`url(#${id}-ochre)`} />
  </svg>
}

/** Wild geese hold a shallow V: a leader, then pairs trailing back and
 *  slightly off the line, never quite symmetrical. */
const FORMATION = [
  { x: 0, y: 0, size: 24 },
  { x: -30, y: -13, size: 22 }, { x: -28, y: 15, size: 22 },
  { x: -61, y: -25, size: 20 }, { x: -58, y: 29, size: 21 },
  { x: -93, y: -39, size: 19 }, { x: -88, y: 44, size: 19 },
  { x: -122, y: -50, size: 17 },
]

function Geese({ className, scale = 1 }: { className: string; scale?: number }) {
  return <div className={`mountain-flock ${className}`} style={{ '--flock-scale': scale } as CSSProperties}>{FORMATION.map((bird, i) => (
    <svg key={i} viewBox="0 0 32 20" style={{ left: bird.x, top: bird.y, width: bird.size, height: bird.size * .625,
      '--wing-delay': `${-((i * 0.83) % 4.4)}s`, '--wing-duration': `${4.2 + (i % 3) * .35}s`,
    } as CSSProperties}>
      <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
        <path className="mountain-wing mountain-wing-left" d="M16 11C12 7 7 6 2 7C7 7 12 10 16 11" />
        <path className="mountain-wing mountain-wing-right" d="M16 11C20 6 25 4 30 5C25 6 20 9 16 11" />
        <path d="M15.1 10.5L17.6 11.2" strokeWidth="1.6" />
      </g>
    </svg>
  ))}</div>
}

export function MountainsTheme() {
  return <div aria-hidden className="theme-scene mountains-scene">
    <MountainLandscape />
    <div className="mountain-mist mountain-mist-far" /><div className="mountain-mist mountain-mist-near" />
    <Geese className="mountain-flock-main" /><Geese className="mountain-flock-far" scale={.56} />
  </div>
}

export function MountainsPreview() {
  return <div aria-hidden className="theme-scene theme-preview mountains-scene"><MountainLandscape /></div>
}
