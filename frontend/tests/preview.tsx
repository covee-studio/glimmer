// 仅开发环境使用的排版验收页，不进入网页或插件的生产构建。
// 使用独立端口访问，避免示例内容进入日常使用的收藏和历史。
import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { MotionConfig } from 'motion/react'
import { ZenMode } from '../src/components/ZenMode'
import { SourcesProvider } from '../src/contexts/SourcesContext'
import { LikedArticlesProvider } from '../src/contexts/LikedArticlesContext'
import { ToastProvider } from '../src/contexts/ToastContext'
import type { DiscoveryItem } from '../src/types/DiscoveryItem'
import '../src/index.css'

const paragraph = '一个安静的阅读空间，不应该要求每一段文字都长得一样。短句需要留白，长文需要连贯的行距；重新遇见一段旧笔记时，重要的是能够自然地读下去。'
const english = 'A reading space should make room for the words, rather than ask the words to fit its decoration. A short passage needs space to breathe; a longer note needs a clear path from one paragraph to the next.'
const note = (id: string, quote: string, thought: string, bookTitle = '阅读练习 · 示例'): DiscoveryItem => ({
  id, source: 'weread', title: quote || thought, url: '',
  raw: { bookId: 'preview', bookTitle, author: '演示内容，非真实书籍', chapter: '关于重新阅读', quote, thought },
})
const cases: Record<string, { label: string; items: DiscoveryItem[]; error?: string; loading?: boolean }> = {
  highlight: { label: '短划线与读后感', items: [note('preview-short', '有些句子，第一次读的时候只是经过。\n\n在一个平常的午后重新遇见，才发现它已经悄悄走进了自己的生活。', '读书留下的，不只是记住了多少。\n也包括在需要的时候，恰好想起来的一句话。')] },
  long: { label: '超长划线与读后感', items: [note('preview-long', Array(14).fill(paragraph).join('\n\n'), Array(8).fill(paragraph).join('\n\n'), '一本书名比较长的示例书：让完整的文字和出处得到合适的空间，而不是被截在屏幕之外')] },
  english: { label: '英文长内容', items: [note('preview-english', Array(10).fill(english).join('\n\n'), english)] },
  thought: { label: '只有读后感', items: [note('preview-thought', '', Array(8).fill(paragraph).join('\n\n'))] },
  memo: { label: '长笔记和长标签', items: [{ id: 'preview-memo', source: 'memos', title: '示例长笔记', url: '', raw: { content: Array(12).fill(paragraph).join('\n\n'), displayTime: '2026-10-22T08:00:00Z', tags: ['阅读记录', 'a-very-long-unbroken-tag-for-layout-verification', '再次遇见'] } }] },
  annotation: { label: '英文注释与摘录', items: [{ id: 'preview-annotation', source: 'hypothesis', title: 'Example annotation', url: '', raw: { text: Array(7).fill(english).join('\n\n'), updated: '2026-10-22T08:00:00Z', tags: ['reading', 'a-very-long-unbroken-tag-for-layout-verification'], target: [{ selector: [{ type: 'TextQuoteSelector', exact: Array(5).fill(english).join('\n\n') }] }] } }] },
  loading: { label: '加载中', items: [], loading: true },
  error: { label: '失败后重试', items: [], error: 'Unable to load content' },
  empty: { label: '来源没有内容', items: [] },
  brokenImage: { label: '百科图片加载失败', items: [{id:'preview-image-failure',source:'wikipedia',title:'示例文章',url:'',raw:{title:'示例文章',displaytitle:'图片加载失败时，文字仍应自然呈现',extract:paragraph.repeat(3),pageid:1,thumbnail:{source:'/tests/intentionally-missing-image.jpg'}}}] },
}

export function Preview() {
  const initial = new URLSearchParams(location.search).get('scenario') ?? 'highlight'
  const [scenario, setScenario] = useState(cases[initial] ? initial : 'highlight')
  const current = cases[scenario]
  return <SourcesProvider><LikedArticlesProvider><ToastProvider><MotionConfig reducedMotion="user">
    <ZenMode key={scenario} isOpen feedKey={scenario} anchorKey={0} items={current.items} initialIndex={0}
      isLoading={current.loading} loadError={current.error} onRetry={() => setScenario('highlight')} />
    <aside className="fixed bottom-2 left-2 z-[300] rounded-md border border-slate-200 bg-white/95 p-2 text-[11px] text-slate-600">
      <label htmlFor="preview-scenario">设计验收 · 示例内容 </label>
      <select id="preview-scenario" value={scenario} onChange={event => setScenario(event.target.value)}>
        {Object.entries(cases).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
      </select>
    </aside>
  </MotionConfig></ToastProvider></LikedArticlesProvider></SourcesProvider>
}
if (import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<Preview />)
