import { afterEach, beforeEach, expect, it, vi } from 'vitest'
let storage: Map<string,string>
let chromeLocal: Record<string,unknown>
beforeEach(() => {
  vi.resetModules()
  storage = new Map()
  chromeLocal = {}
  vi.stubGlobal('__IS_EXTENSION__', true)
  vi.stubGlobal('window', new EventTarget())
  vi.stubGlobal('localStorage', { getItem:(key:string)=>storage.get(key)??null, setItem:(key:string,value:string)=>storage.set(key,value), removeItem:(key:string)=>storage.delete(key) })
  const queues = new Map<string,Promise<unknown>>()
  vi.stubGlobal('navigator', { locks: { request:(key:string, operation:()=>Promise<unknown>) => {
    const result = (queues.get(key)??Promise.resolve()).then(operation)
    queues.set(key,result.catch(()=>undefined))
    return result
  } } })
  vi.stubGlobal('chrome', { storage: { local: {
    get:(_keys:unknown, callback:(data:Record<string,unknown>)=>void)=>callback({...chromeLocal}),
    remove:(keys:string[], callback:()=>void)=>{keys.forEach(key=>delete chromeLocal[key]);callback()},
  } } })
})
afterEach(()=>vi.unstubAllGlobals())
it('invalidates request signals in another tab and rejects its pending result', async () => {
  const tabA = await import('../src/utils/sourceLifecycle')
  vi.resetModules()
  const tabB = await import('../src/utils/sourceLifecycle')
  const generation = tabB.sourceGeneration('weread')
  const signal = tabB.sourceSignal('weread')
  tabA.invalidateSource('weread')
  expect(signal.aborted).toBe(true)
  expect(()=>tabB.assertSourceCurrent('weread',generation)).toThrow()
  const write = vi.fn()
  await expect(tabB.commitSourceCache('weread',generation,write)).rejects.toThrow()
  expect(write).not.toHaveBeenCalled()
})
it('waits for an already-started cache write before disconnect cleanup', async () => {
  const life = await import('../src/utils/sourceLifecycle')
  let release!:()=>void
  let entered!:()=>void
  const started = new Promise<void>(resolve=>{entered=resolve})
  const gate = new Promise<void>(resolve=>{release=resolve})
  const writing = life.commitSourceCache('weread',life.sourceGeneration('weread'),async()=>{
    entered()
    await gate
    chromeLocal['wikinote-feed-v2-weread-fixture'] = 'private note'
  })
  await started
  life.invalidateSource('weread')
  const clearing = life.clearSourceCaches('weread')
  release()
  await Promise.all([writing,clearing])
  expect(Object.keys(chromeLocal)).not.toContain('wikinote-feed-v2-weread-fixture')
})
it('cleans Chrome-only caches while retaining intentional favorites', async () => {
  const life = await import('../src/utils/sourceLifecycle')
  chromeLocal = {'wikinote-feed-v2-weread-fixture':['private'], 'wikinote-liked-records-v1':['saved']}
  await life.clearSourceCaches('weread')
  expect(chromeLocal).toEqual({'wikinote-liked-records-v1':['saved']})
})
it('rejects a fetch scheduled with a removed or replaced source configuration', async () => {
  const life = await import('../src/utils/sourceLifecycle')
  storage.set('wikinote-source-configs',JSON.stringify({weread:{__cacheId:'new'}}))
  expect(()=>life.assertSourceConfigured('weread','old')).toThrow()
  expect(()=>life.assertSourceConfigured('weread','new')).not.toThrow()
  storage.set('wikinote-source-configs','{}')
  expect(()=>life.assertSourceConfigured('weread','new')).toThrow()
})
