import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { ZenContent } from '../src/components/ZenMode'
import { ReadingState } from '../src/components/ui/ReadingState'
import { ResilientImage } from '../src/components/ui/ResilientImage'
import type { DiscoveryItem } from '../src/types/DiscoveryItem'
import '../src/index.css'

const items: Record<string, DiscoveryItem> = {
  Title: { id:'review-title',source:'wikipedia',title:'A quieter space for reading, remembering, and discovering something unexpected',url:'',raw:{displaytitle:'A quieter space for reading, remembering, and discovering something unexpected',extract:'Good ideas often arrive in the small spaces between things. Give them a little room, and a little time.'} },
  中文标题: {id:'review-zh',source:'wikipedia',title:'让每一次打开新标签页，都成为与值得阅读的文字不期而遇的片刻',url:'',raw:{displaytitle:'让每一次打开新标签页，都成为与值得阅读的文字不期而遇的片刻',extract:'在纷繁的信息之间，留下一点安静，重新看见那些曾经打动我们的文字。'}},
  Note: {id:'review-note',source:'memos',title:'阅读笔记',url:'',raw:{uid:'review-note',title:'阅读笔记',content:Array.from({length:7},(_,i)=>`${i+1}. 走得慢一点，不代表没有前进。我们可以把注意力留给真正重要的事情，也给尚未发生的惊喜留一点空间。\n\n让阅读保持自己的节奏，段落之间有呼吸，长句也可以从容地展开。`).join('\n\n'),tags:['阅读','慢生活'],displayTime:'2026-10-25T00:00:00Z'}},
  Highlight:{id:'review-quote',source:'weread',title:'留一点安静',url:'',raw:{bookId:'review',bookTitle:'阅读场景示例',author:'示例作者',chapter:'第三章 · 慢慢来',quote:'我们需要的，也许只是一个可以安静读完一段话的地方。\n\n在这里，时间可以走得慢一点。',thought:'好的设计为内容留出空间，也为使用它的人留出空间。'}},
  English:{id:'review-en',source:'memos',title:'A reading note',url:'',raw:{uid:'review-en',title:'A reading note',content:'A quiet interface leaves enough room for the words themselves. It does not need to announce every detail.\n\nA longer paragraph should still feel comfortable to read. Its line length, rhythm, and spacing should support the thought rather than make the reader work around the layout.',tags:['reading'],displayTime:'2026-10-25T00:00:00Z'}},
}
export function PolishReview() {
  const [view,setView]=useState('Title')
  const [dark,setDark]=useState(false)
  const [image,setImage]=useState('/tests/intentionally-missing-image.png')
  const [action,setAction]=useState('')
  return <main className="reading-room" data-dark={dark} style={{minHeight:'100dvh',background:dark?'#17212b':'#f6f7f2',padding:'100px 28px 48px'}}>
    <nav aria-label="Review scenarios" style={{position:'absolute',top:16,left:16,right:16,display:'flex',flexWrap:'wrap',gap:6}}>
      {[...Object.keys(items),'Offline','Error','Empty','Images'].map(label=><button className="ui-secondary-button" key={label} onClick={()=>setView(label)}>{label}</button>)}
      <button className="ui-secondary-button" onClick={()=>setDark(!dark)}>Toggle dark</button>
    </nav>
    <div style={{maxWidth:820,margin:'70px auto 0'}}>
      {items[view] ? <ZenContent item={items[view]} dark={dark}/> : view==='Images' ? <section style={{display:'flex',alignItems:'center',gap:16}}><ResilientImage src={image} className="h-16 w-16 rounded-lg" contain/><button className="ui-secondary-button" onClick={()=>setImage('/source-icons/wikipedia.png')}>Recover image</button><span>缺图替代与 URL 更新恢复</span></section> : <ReadingState offline={view==='Offline'} loading={false} error={view==='Error'?'Example failure':undefined} onRetry={()=>setAction('Retry selected')} onSources={()=>setAction('Sources selected')}/>}
      <p role="status">{action}</p>
    </div>
  </main>
}
if(import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<PolishReview/> )
