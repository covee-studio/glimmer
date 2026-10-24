import { useId, type CSSProperties } from 'react'

// Broad wooded shoulders, not rocky sawtooth peaks. Shared with the thumbnail.
const RIDGES = [
  'M-40 293C45 295 91 266 139 249S207 201 257 214S323 257 391 250S467 228 523 250S611 282 679 254S761 208 817 213S890 243 951 248S1070 270 1124 253S1196 230 1240 241V460H-40Z',
  'M-40 340C34 327 92 310 135 278S184 244 217 261S263 300 316 315C385 342 432 321 480 308S563 307 627 329C709 351 742 302 788 277S846 242 879 258S932 305 979 313S1084 290 1126 304S1205 329 1240 316V460H-40Z',
  'M-40 383C29 371 66 328 105 310S162 291 193 309S240 352 284 365C354 386 399 367 451 374S546 403 601 382C664 361 689 328 727 332S791 376 849 383C918 391 964 344 1008 347S1083 380 1137 371S1205 356 1240 373V460H-40Z',
  'M-40 405 Q61 354 155 386 T325 401 Q415 382 467 405 T643 420 Q747 376 821 401 T1001 389 Q1104 365 1240 390 V460 H-40Z',
]

function MountainLandscape() {
  const id = useId().replace(/:/g, '')
  return <svg viewBox="0 0 1200 460" preserveAspectRatio="none" className="mountain-landscape">
    <defs>{['#b7c5be', '#92aaa0', '#648578', '#45675d'].map((color, i) => (
      <linearGradient key={color} id={`${id}-ridge-${i}`} x2="0" y2="1">
        <stop stopColor={color} /><stop offset="1" stopColor={['#e2e5d9', '#d0d9cd', '#a3b8aa', '#819d8d'][i]} />
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
  return <div className="mountain-flock" style={{ animationDelay: '-7s' }}>{FLOCK.map((bird, i) => (
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

export function MountainsTheme() {
  return <div aria-hidden className="theme-scene mountains-scene">
    <MountainLandscape /><div className="mountain-mist mountain-mist-far" /><div className="mountain-mist mountain-mist-near" /><Birds />
  </div>
}

export function MountainsPreview() {
  return <div className="theme-scene theme-preview mountains-scene"><MountainLandscape /></div>
}
