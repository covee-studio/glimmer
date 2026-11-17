import { useId, type CSSProperties } from 'react'
import { SCENE_SURFACES } from './sceneSurfaces'

/** Soft folded banks give the fog volume; the layers occlude one another. */
function MistVolume({ foreground = false }: { foreground?: boolean }) {
  const id = useId()
  return <svg className={`mist-volume ${foreground ? 'mist-volume-near' : 'mist-volume-far'}`}
    viewBox="0 0 1440 700" preserveAspectRatio="none">
    <defs>
      <linearGradient id={`${id}-body`} x1="0" y1="0" x2=".25" y2="1">
        <stop stopColor={foreground ? '#ffffff' : '#789bb8'} stopOpacity={foreground ? '.94' : '.62'} />
        <stop offset=".48" stopColor={foreground ? '#d9e8f3' : '#b4cddd'} stopOpacity=".78" />
        <stop offset="1" stopColor={foreground ? '#89aac2' : '#eaf2f7'} stopOpacity={foreground ? ".3" : ".12"} />
      </linearGradient>
      <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2=".6">
        <stop stopColor="white" stopOpacity=".05" />
        <stop offset=".4" stopColor="white" stopOpacity=".65" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d={foreground
      ? 'M-120,290 C80,165 260,390 490,265 C670,165 780,85 980,155 C1190,240 1320,65 1560,125 L1560,760 L-120,760Z'
      : 'M-120,-60H1560V340 C1320,470 1160,185 920,270 C690,355 620,520 380,405 C170,310 30,475 -120,410Z'} fill={`url(#${id}-body)`} />
    <path d={foreground
      ? 'M-120,375 C160,225 290,470 535,315 C770,170 855,240 1050,225 C1280,205 1340,140 1560,220 L1560,760H-120Z'
      : 'M-120,-60H1560V225 C1270,375 1130,120 890,220 C660,320 570,405 360,325 C135,235 40,385 -120,340Z'} fill={`url(#${id}-edge)`} />
  </svg>
}

// Mountain ridges inherited from the retired Mountains theme, re-graded into
// the fog: cool blue-grey instead of wooded green, low contrast, softened so
// the fog banks keep occluding them. Broad wooded shoulders, not sawtooth peaks.
const RIDGES = [
  'M-40 293C45 295 91 266 139 249S207 201 257 214S323 257 391 250S467 228 523 250S611 282 679 254S761 208 817 213S890 243 951 248S1070 270 1124 253S1196 230 1240 241V460H-40Z',
  'M-40 340C34 327 92 310 135 278S184 244 217 261S263 300 316 315C385 342 432 321 480 308S563 307 627 329C709 351 742 302 788 277S846 242 879 258S932 305 979 313S1084 290 1126 304S1205 329 1240 316V460H-40Z',
  'M-40 383C29 371 66 328 105 310S162 291 193 309S240 352 284 365C354 386 399 367 451 374S546 403 601 382C664 361 689 328 727 332S791 376 849 383C918 391 964 344 1008 347S1083 380 1137 371S1205 356 1240 373V460H-40Z',
]

function MistRidges() {
  const id = useId().replace(/:/g, '')
  return <svg viewBox="0 0 1200 460" preserveAspectRatio="none" className="mist-ridges" aria-hidden>
    <defs>{['#a9bfcc', '#8fabbc', '#7595a8'].map((color, i) => (
      <linearGradient key={color} id={`${id}-ridge-${i}`} x2="0" y2="1">
        <stop stopColor={color} /><stop offset="1" stopColor={['#dfe8ec', '#ccd9e0', '#b7c9d3'][i]} />
      </linearGradient>
    ))}</defs>
    {RIDGES.map((d, i) => <path key={d} d={d} fill={`url(#${id}-ridge-${i})`} />)}
  </svg>
}

// An uneven, loose formation; each bird beats briefly, then glides.
const FLOCK = [
  { x: 62, y: 15, size: 20, delay: -1.4, duration: 3.8, opacity: .78 },
  { x: 36, y: 27, size: 17, delay: -2.3, duration: 4.2, opacity: .64 },
  { x: 9, y: 39, size: 14, delay: -.5, duration: 3.6, opacity: .48 },
  { x: 40, y: 4, size: 15, delay: -3.1, duration: 4.5, opacity: .56 },
  { x: 13, y: -5, size: 12, delay: -1.9, duration: 4.1, opacity: .38 },
]

function Birds() {
  return <div className="mist-flock" style={{ animationDelay: '-7s' }}>{FLOCK.map((bird, i) => (
    <svg key={i} viewBox="0 0 32 20" style={{ left: bird.x, top: bird.y, width: bird.size, height: bird.size * .625, opacity: bird.opacity,
      '--wing-delay': `${bird.delay}s`, '--wing-duration': `${bird.duration}s`,
    } as CSSProperties}>
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path className="mountain-wing mountain-wing-left" d="M16 11C12 7 7 6 2 7C7 7 12 10 16 11" />
        <path className="mountain-wing mountain-wing-right" d="M16 11C20 6 25 4 30 5C25 6 20 9 16 11" />
        <path d="M15.1 10.5L17.6 11.2" strokeWidth="1.5" />
      </g>
    </svg>
  ))}</div>
}

function MistAtmosphere() {
  return <>
    <MistVolume />
    <MistRidges />
    <div className="mist-sunbeam" />
    <MistVolume foreground />
    <Birds />
    <div className="mist-reading-light" />
  </>
}
export function MistTheme() {
  return <div aria-hidden className="theme-scene mist-scene" style={{ background: SCENE_SURFACES.mist }}><MistAtmosphere /></div>
}
export function MistPreview() {
  return <div aria-hidden className="theme-scene theme-preview mist-scene" style={{ background: SCENE_SURFACES.mist }}><MistAtmosphere /></div>
}
