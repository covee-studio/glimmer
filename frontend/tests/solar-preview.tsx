import { createRoot } from 'react-dom/client'
import { SolarArtwork } from '../src/components/zen/SolarTheme'
import { solarLightAt } from '../src/components/zen/solarLight'
import '../src/index.css'
import '../src/components/zen/theme-scenes.css'

export function SolarReview() {
  return <main style={{ background: '#f5f5f2', padding: 24, minHeight: '100vh' }}>
    <h1 style={{ fontSize: 18, marginBottom: 16, color: '#35453c' }}>Solar · 一日光线（固定时刻示例）</h1>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16 }}>
      {[[6, '清晨 · 06:00'], [12, '中午 · 12:00'], [16, '下午 · 16:00'], [22, '晚间 · 22:00']].map(([hour, label]) => <section key={hour} style={{ position: 'relative', height: 310, overflow: 'hidden', borderRadius: 14 }}>
        <SolarArtwork light={solarLightAt(Number(hour))} />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', gap: 18, textAlign: 'center', color: '#334439' }}><span style={{ fontSize: 12 }}>{label}</span><p className="font-serif-editorial" style={{ fontSize: 25 }}>让光线，跟着时间慢慢变化。</p></div>
      </section>)}
    </div>
  </main>
}
if (import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<SolarReview />)
