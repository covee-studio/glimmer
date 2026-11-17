import { useId, type CSSProperties } from 'react'

// Far ridgeline: soft, rounded swells with no sharp points. Pale and low in
// contrast, it reads as distant hills in haze and stays clear of the text.
const PEAKS =
  'M-40 292C28 292 28 232 95 232C172 232 172 262 250 262C290 262 290 252 330 252C400 252 400 192 470 192C535 192 535 240 600 240C635 240 635 246 670 246C725 246 725 206 780 206C840 206 840 252 900 252C970 252 970 184 1040 184C1095 184 1095 236 1150 236C1195 236 1195 246 1240 246V460H-40Z'

// Broad wooded shoulders, not rocky sawtooth peaks. Shared with the thumbnail.
const RIDGES = [
  'M-40 293C45 295 91 266 139 249S207 201 257 214S323 257 391 250S467 228 523 250S611 282 679 254S761 208 817 213S890 243 951 248S1070 270 1124 253S1196 230 1240 241V460H-40Z',
  'M-40 340C34 327 92 310 135 278S184 244 217 261S263 300 316 315C385 342 432 321 480 308S563 307 627 329C709 351 742 302 788 277S846 242 879 258S932 305 979 313S1084 290 1126 304S1205 329 1240 316V460H-40Z',
  'M-40 383C29 371 66 328 105 310S162 291 193 309S240 352 284 365C354 386 399 367 451 374S546 403 601 382C664 361 689 328 727 332S791 376 849 383C918 391 964 344 1008 347S1083 380 1137 371S1205 356 1240 373V460H-40Z',
  'M-40 405 Q61 354 155 386 T325 401 Q415 382 467 405 T643 420 Q747 376 821 401 T1001 389 Q1104 365 1240 390 V460 H-40Z',
]

const RIDGE_COLORS = [['#b7c5be', '#e2e5d9'], ['#92aaa0', '#d0d9cd'], ['#648578', '#a3b8aa'], ['#45675d', '#819d8d']]

function MountainLandscape() {
  const id = useId().replace(/:/g, '')
  return <svg viewBox="0 0 1200 460" preserveAspectRatio="none" className="mountain-landscape">
    <defs>
      <linearGradient id={`${id}-peaks`} x2="0" y2="1">
        <stop stopColor="#a9bcbc" /><stop offset=".62" stopColor="#d3ddd6" /><stop offset="1" stopColor="#e9ebdf" />
      </linearGradient>
      {RIDGE_COLORS.map(([top, bottom], i) => (
        <linearGradient key={top} id={`${id}-ridge-${i}`} x2="0" y2="1">
          <stop stopColor={top} /><stop offset="1" stopColor={bottom} />
        </linearGradient>
      ))}
    </defs>
    <path className="mountain-peaks" d={PEAKS} fill={`url(#${id}-peaks)`} />
    {RIDGES.map((d, i) => <path key={d} d={d} fill={`url(#${id}-ridge-${i})`} />)}
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
