// 仅开发环境使用的主题视觉验收页，不进入网页或插件的生产构建。
// ?theme=<id> 渲染 Zen 阅读态下的单个主题；?mode=backdrop 只渲染背景层；?mode=grid 渲染全部主题缩略墙。
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import { ZenMode } from '../src/components/ZenMode'
import { SourcesProvider } from '../src/contexts/SourcesContext'
import { LikedArticlesProvider } from '../src/contexts/LikedArticlesContext'
import { ToastProvider } from '../src/contexts/ToastContext'
import { ZEN_THEMES } from '../src/utils/zenThemes'
import type { DiscoveryItem } from '../src/types/DiscoveryItem'
import '../src/index.css'

const sample: DiscoveryItem = {
  id: 'gallery-sample', source: 'weread', title: '重新遇见', url: '',
  raw: {
    bookId: 'gallery', bookTitle: '阅读练习 · 示例', author: '演示内容，非真实书籍', chapter: '关于重新阅读',
    quote: '有些句子，第一次读的时候只是经过。\n\n在一个平常的午后重新遇见，才发现它已经悄悄走进了自己的生活。',
    thought: '读书留下的，不只是记住了多少。\n也包括在需要的时候，恰好想起来的一句话。',
  },
}

const params = new URLSearchParams(location.search)
const themeId = params.get('theme') ?? ZEN_THEMES[0].id
const mode = params.get('mode') ?? 'zen'

function ZenShot() {
  localStorage.setItem('zen-theme-id', themeId)
  return <SourcesProvider><LikedArticlesProvider><ToastProvider><MotionConfig reducedMotion="user">
    <ZenMode isOpen feedKey={`gallery-${themeId}`} anchorKey={0} items={[sample]} initialIndex={0} />
  </MotionConfig></ToastProvider></LikedArticlesProvider></SourcesProvider>
}

function BackdropShot() {
  const theme = ZEN_THEMES.find((t) => t.id === themeId) ?? ZEN_THEMES[0]
  const Scene = theme.Backdrop
  return <div style={{ position: 'fixed', inset: 0 }}><Scene /></div>
}

function GridShot() {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 12, background: '#e8e8e4', minHeight: '100vh' }}>
    {ZEN_THEMES.map((t) => {
      const Scene = t.Backdrop
      return <figure key={t.id} style={{ margin: 0 }}>
        <div style={{ position: 'relative', height: 220, borderRadius: 10, overflow: 'hidden' }} data-paused="true"><Scene /></div>
        <figcaption style={{ font: '12px/2 system-ui', color: '#333' }}>{t.name} · {t.id}{t.dark ? ' · dark' : ''}</figcaption>
      </figure>
    })}
  </div>
}

export function Gallery() {
  if (mode === 'grid') return <GridShot />
  if (mode === 'backdrop') return <BackdropShot />
  return <ZenShot />
}
if (import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<Gallery />)
