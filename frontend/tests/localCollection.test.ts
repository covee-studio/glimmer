import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { DiscoveryItem } from '../src/types/DiscoveryItem'

let storage: Map<string,string>
let chromeLocal: Record<string,unknown>
beforeEach(() => {
  vi.resetModules()
  storage = new Map()
  chromeLocal = {}
  vi.stubGlobal('__IS_EXTENSION__', true)
  vi.stubGlobal('localStorage', { getItem:(key:string) => storage.get(key) ?? null, setItem:(key:string,value:string) => storage.set(key,value), removeItem:(key:string) => storage.delete(key) })
  const queues = new Map<string,Promise<unknown>>()
  vi.stubGlobal('navigator', { locks: { request: (key:string, operation:()=>Promise<unknown>) => {
    const result = (queues.get(key) ?? Promise.resolve()).then(operation)
    queues.set(key,result.catch(() => undefined))
    return result
  } } })
  vi.stubGlobal('chrome', { storage: { local: {
    get: (_keys: unknown, callback: (value:Record<string,unknown>)=>void) => queueMicrotask(() => callback({...chromeLocal})),
    set: (data:Record<string,unknown>, callback:()=>void) => queueMicrotask(() => { Object.assign(chromeLocal,data); callback() }),
    remove: (keys:string[], callback:()=>void) => { keys.forEach(key => delete chromeLocal[key]); callback() },
  } } })
})
afterEach(() => vi.unstubAllGlobals())
const item = (id:string):DiscoveryItem => ({ id, source:'weread', title:id, url:'', raw:{quote:id} })

it('preserves simultaneous saves from separate tabs with separate module state', async () => {
  const tabA = await import('../src/utils/localCollection')
  vi.resetModules()
  const tabB = await import('../src/utils/localCollection')
  await Promise.all([
    tabA.updateLocalFavorites(records => new Map([...records,['a',{id:'a',updatedAt:1,item:item('a')}]])),
    tabB.updateLocalFavorites(records => new Map([...records,['b',{id:'b',updatedAt:1,item:item('b')}]])),
  ])
  expect((chromeLocal[tabA.LOCAL_RECORDS_KEY] as {id:string}[]).map(record=>record.id).sort()).toEqual(['a','b'])
})
it('does not resurrect a deleted item when another tab merges a stale snapshot', async () => {
  const store = await import('../src/utils/localCollection')
  const stale = {id:'a',updatedAt:1,item:item('a')}
  await store.updateLocalFavorites(() => new Map([['a',stale]]))
  await store.updateLocalFavorites(records => new Map([...records,['a',{id:'a',updatedAt:2,deleted:true}]]))
  const result = await store.updateLocalFavorites(records => store.mergeLocalRecords(records,[stale,{id:'b',updatedAt:3,item:item('b')}]))
  expect(result.get('a')?.deleted).toBe(true)
  expect(result.get('b')?.item?.id).toBe('b')
})
it('orders recent history saves and clear without bringing cleared history back', async () => {
  const store = await import('../src/utils/localCollection')
  await Promise.all([
    store.updateLocalRecent(records => [{item:item('a'),seenAt:1},...records]),
    store.updateLocalRecent(records => [{item:item('b'),seenAt:2},...records]),
  ])
  expect((chromeLocal[store.RECENT_RECORDS_KEY] as {item:DiscoveryItem}[]).map(record=>record.item.id)).toEqual(['b','a'])
  await store.updateLocalRecent(() => [])
  await store.updateLocalRecent(records => [{item:item('c'),seenAt:3},...records])
  expect((chromeLocal[store.RECENT_RECORDS_KEY] as {item:DiscoveryItem}[]).map(record=>record.item.id)).toEqual(['c'])
})
it('migrates a legacy collection only when the record store is absent', async () => {
  const store = await import('../src/utils/localCollection')
  const legacy = new Map([['a',{id:'a',updatedAt:0,item:item('a')}]])
  await store.updateLocalFavorites(records=>records,legacy)
  expect(chromeLocal[store.LOCAL_RECORDS_KEY]).toHaveLength(1)
  chromeLocal[store.LOCAL_RECORDS_KEY] = []
  const result = await store.updateLocalFavorites(records=>records,legacy)
  expect(result.size).toBe(0)
})
