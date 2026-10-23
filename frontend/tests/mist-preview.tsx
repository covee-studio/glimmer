import { createRoot } from 'react-dom/client'
import { MistTheme } from '../src/components/zen/MistTheme'
import '../src/index.css'
import '../src/components/zen/theme-scenes.css'

export function MistReview() {
  return <main style={{ position: 'relative', height: '100dvh', overflow: 'hidden', color: '#293c31' }}>
    <MistTheme />
    <article style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(80%,640px)', textAlign: 'center' }}>
      <p style={{ fontSize: 11, letterSpacing: '.2em', marginBottom: 32 }}>MIST · 阅读场景示例</p>
      <h1 className="font-serif-editorial" style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 400 }}>在雾里，留一点安静。</h1>
      <p style={{ fontSize: 13, lineHeight: 1.8, marginTop: 24, color: '#667b84' }}>光线从雾隙透进来，远近之间，慢慢有了层次。</p>
    </article>
  </main>
}
if (import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<MistReview />)
