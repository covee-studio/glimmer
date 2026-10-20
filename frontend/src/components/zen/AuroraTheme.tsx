// Visual geometry and palette adapted from the user-owned Magic Patterns design.
// Source: https://www.magicpatterns.com/c/ckuiwzhktsyxpvxzxcva5h
import { useMemo } from 'react'
import { sceneRandom } from './sceneGeometry'

interface Star {
  left: number
  top: number
  size: number
  dur: number
  delay: number
}

function makeStars(count: number): Star[] {
  const random = sceneRandom(809)
  return Array.from({ length: count }).map(() => ({
    left: random() * 100,
    top: random() * 55,
    size: 0.8 + random() * 1,
    dur: 3 + random() * 3,
    delay: random() * 4,
  }))
}

/**
 * 极光 —— 深色天幕上柔和的光幕缓缓起伏、明灭流转，上方缀几点疏淡的星光。
 * 仅用叠层的柔光渐变（screen 混合模式）表现丝绸质感，不叠加任何硬边纹理，
 * 避免出现类似屏幕故障的怪异条纹。
 */
export function AuroraTheme() {
  const stars = useMemo(() => makeStars(18), [])
  return (
    <div
      aria-hidden
      className="theme-scene aurora-scene"
      style={{
        background:
          'linear-gradient(180deg, #060a14 0%, #0a1220 45%, #0d1522 100%)',
      }}
    >
      {/* 疏淡的星光，为光幕之上的天幕增加纵深，数量克制、不喧宾夺主 */}
      {stars.map((star, index) => (
        <span
          key={index}
          className="aurora-star absolute rounded-full bg-white"
          style={{ left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size, animationDuration: `${star.dur}s`, animationDelay: `${star.delay}s` }}

        />
      ))}

      {/* 光幕层 1：主色带，青绿向浅蓝晕染 */}
      <div
        className="aurora-veil aurora-veil-1 absolute inset-x-[-15%]"
        style={{
          top: '-10%',
          height: '75%',
          background:
            'radial-gradient(ellipse 55% 100% at 30% 0%, rgba(72,214,168,0.55) 0%, rgba(72,214,168,0) 60%), radial-gradient(ellipse 45% 90% at 65% 10%, rgba(92,196,190,0.4) 0%, rgba(92,196,190,0) 65%)',
          filter: 'blur(46px)',
          mixBlendMode: 'screen',
        }}

      />

      {/* 光幕层 2：紫罗兰点缀 */}
      <div
        className="aurora-veil aurora-veil-2 absolute inset-x-[-15%]"
        style={{
          top: '4%',
          height: '60%',
          background:
            'radial-gradient(ellipse 40% 90% at 72% 20%, rgba(140,120,220,0.38) 0%, rgba(140,120,220,0) 62%)',
          filter: 'blur(50px)',
          mixBlendMode: 'screen',
        }}

      />

      {/* 光幕层 3：极淡的粉调点缀，增加层次，同样不引入硬边纹理 */}
      <div
        className="aurora-veil aurora-veil-3 absolute inset-x-[-15%]"
        style={{
          top: '-4%',
          height: '50%',
          background:
            'radial-gradient(ellipse 35% 80% at 45% 30%, rgba(210,150,190,0.22) 0%, rgba(210,150,190,0) 60%)',
          filter: 'blur(55px)',
          mixBlendMode: 'screen',
        }}

      />
    </div>
  )
}

export function AuroraPreview() {
  return (
    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(180deg, #060a14 0%, #0d1522 100%)' }}
    >
      <div
        className="absolute inset-x-[-10%]"
        style={{
          top: '-10%',
          height: '70%',
          background:
            'radial-gradient(ellipse 55% 90% at 35% 10%, rgba(72,214,168,0.6) 0%, rgba(72,214,168,0) 62%), radial-gradient(ellipse 45% 80% at 70% 25%, rgba(140,120,220,0.35) 0%, rgba(140,120,220,0) 65%)',
          filter: 'blur(14px)',
          mixBlendMode: 'screen',
        }}
      />
      <span
        className="aurora-star absolute rounded-full bg-white"
        style={{ top: '78%', left: '25%', width: 1.5, height: 1.5 }}
      />
      <span
        className="absolute rounded-full bg-white/70"
        style={{ top: '85%', left: '62%', width: 1.2, height: 1.2 }}
      />
    </div>
  )
}

