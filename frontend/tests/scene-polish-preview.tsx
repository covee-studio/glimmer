import { createRoot } from 'react-dom/client'
import { MountainsTheme } from '../src/components/zen/MountainsTheme'
import { RainbowTheme, RainbowPreview } from '../src/components/zen/RainbowTheme'
import { SakuraPreview } from '../src/components/zen/SakuraTheme'
import '../src/index.css'
import '../src/components/zen/theme-scenes.css'

function Review() {
  return <main style={{ background: '#fafaf7', minHeight: '100vh', padding: 28, color: '#293c31' }}>
    <h1 style={{fontSize:18, marginBottom:20}}>自然场景 · 细节验收</h1>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,340px),1fr))',gap:20}}>
      {[[MountainsTheme,'高山云影'],[RainbowTheme,'雨后天晴']].map(([Scene,label]) => {
        const Component = Scene as typeof MountainsTheme
        return <section key={String(label)}><h2 style={{fontSize:13,marginBottom:10}}>{String(label)}</h2><div style={{position:'relative',height:420,overflow:'hidden',borderRadius:12}}><Component /><p style={{position:'absolute',top:'47%',width:'100%',textAlign:'center',fontSize:23,fontFamily:'Georgia,serif'}}>留一点安静，给此刻。</p></div></section>
      })}
    </div>
    <div style={{display:'flex',gap:24,marginTop:24}}>{[[SakuraPreview,'樱花封面'],[RainbowPreview,'雨后封面']].map(([Scene,label])=>{
      const Component=Scene as typeof SakuraPreview
      return <section key={String(label)}><p style={{fontSize:12,marginBottom:8}}>{String(label)} · 实际尺寸</p><div style={{position:'relative',width:67,height:48,overflow:'hidden',borderRadius:8}}><Component /></div></section>
    })}</div>
  </main>
}
if (import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<Review />)
