import { beforeEach, afterEach, expect, it, vi } from 'vitest'

let local: Map<string, string>
let chromeLocal: Record<string, unknown>
beforeEach(() => {
  vi.resetModules()
  local = new Map()
  chromeLocal = {}
  vi.stubGlobal('__IS_EXTENSION__', true)
  vi.stubGlobal('localStorage', { getItem: (key: string) => local.get(key) ?? null, setItem: (key: string, value: string) => local.set(key, value), removeItem: (key: string) => local.delete(key) })
  vi.stubGlobal('chrome', { storage: { local: {
    get: (_keys: string[], callback: (data: Record<string, unknown>) => void) => callback(chromeLocal),
    set: (data: Record<string, unknown>, callback: () => void) => { Object.assign(chromeLocal, data); callback() },
    remove: (keys: string[], callback: () => void) => { keys.forEach(key => delete chromeLocal[key]); callback() },
  } } })
})
afterEach(() => vi.unstubAllGlobals())

it('clears both Chrome storage and its mirror so deleted recent content cannot reappear', async () => {
  const { StorageAdapter } = await import('../src/utils/environment')
  await StorageAdapter.set('recent', ['private note'])
  await StorageAdapter.remove('recent')
  expect(await StorageAdapter.get('recent')).toBeNull()
  expect(local.has('recent')).toBe(false)
})

it('separates accounts after identical long endpoint prefixes', async () => {
  const { feedCache } = await import('../src/utils/feedCache')
  const prefix = `{"endpoint":"https://${'a'.repeat(60)}.example","token":"revision:`
  expect(feedCache.key('memos', '', `${prefix}one"}`)).not.toBe(feedCache.key('memos', '', `${prefix}two"}`))
})

it('treats malformed cached items as a miss', async () => {
  const { feedCache } = await import('../src/utils/feedCache')
  local.set('wikinote-feed-v2-test', JSON.stringify({ timestamp: Date.now(), items: 'invalid' }))
  expect(feedCache.getSync('test')).toBeNull()
})

it('does not upload WeRead text, credentials or tombstones to Chrome Sync', async () => {
  const { StorageAdapter } = await import('../src/utils/environment')
  const write = vi.spyOn(StorageAdapter, 'syncSet').mockResolvedValue()
  vi.spyOn(StorageAdapter, 'syncRemove').mockResolvedValue()
  const { writeFavoriteSyncRecords } = await import('../src/utils/favoriteSync')
  await writeFavoriteSyncRecords([
    { id: 'weread-private', updatedAt: 1, item: { id: 'weread-private', source: 'weread', title: 'private thought', url: '', raw: { token: 'wrk-secret' } } },
    { id: 'weread-deleted', updatedAt: 2, deleted: true },
  ])
  expect(JSON.stringify(write.mock.calls)).not.toMatch(/private thought|wrk-secret|weread-/)
})


it('syncs essential favorite previews without redundant private metadata', async () => {
  const { StorageAdapter } = await import('../src/utils/environment')
  const write = vi.spyOn(StorageAdapter, 'syncSet').mockResolvedValue()
  vi.spyOn(StorageAdapter, 'syncRemove').mockResolvedValue()
  const { writeFavoriteSyncRecords } = await import('../src/utils/favoriteSync')
  await writeFavoriteSyncRecords([
    {
      id: 'memo-one', updatedAt: 10,
      item: {
        id: 'memo-one', source: 'memos', title: 'My note',
        url: 'https://notes.example/m/memo-one',
        raw: {
          uid: 'one', title: 'My note', excerpt: 'A short preview',
          endpoint: 'https://notes.example', imageUrl: 'https://notes.example/file/p.png',
          tags: ['tag'], content: 'Private full note body',
        },
      },
    },
    {
      id: 'hypothesis-one', updatedAt: 11,
      item: {
        id: 'hypothesis-one', source: 'hypothesis', title: 'Selected text',
        url: 'https://example.com/article',
        raw: {
          id: 'one', uri: 'https://example.com/article', text: 'Annotation',
          user: 'acct:person@hypothes.is', group: 'private-team',
          document: { title: ['Article title'], link: [{ href: 'https://example.com/hidden' }] },
          target: [{ selector: [{ type: 'TextQuoteSelector', exact: 'Selected text' }] }],
        },
      },
    },
  ])
  const payload = write.mock.calls[0]?.[0] as Record<string, unknown>
  const chunks = Object.entries(payload)
    .filter(([key]) => key.startsWith('wikinote-favorites-sync-v1-chunk-'))
    .flatMap(([, value]) => value as Array<{ item?: { url: string; raw: Record<string, unknown> } }>)
  expect(chunks).toHaveLength(2)
  const memo = chunks[0].item!
  expect(memo.url).toBe('https://notes.example/m/memo-one')
  expect(memo.raw.excerpt).toBe('A short preview')
  expect(memo.raw).not.toHaveProperty('endpoint')
  expect(memo.raw).not.toHaveProperty('content')
  const annotation = chunks[1].item!
  expect(annotation.raw.quote).toBe('Selected text')
  expect(annotation.raw.text).toBe('Annotation')
  expect(annotation.raw).not.toHaveProperty('group')
  expect(annotation.raw.document).not.toHaveProperty('link')
})

it('deletes only Glimmer favorite sync keys, preserving unrelated Chrome Sync data', async () => {
  const { StorageAdapter } = await import('../src/utils/environment')
  vi.spyOn(StorageAdapter, 'syncKeys').mockResolvedValue([
    'wikinote-favorites-sync-v1',
    'wikinote-favorites-sync-v1-chunk-0',
    'wikinote-favorites-sync-v1-chunk-orphan',
    'some-unrelated-setting',
  ])
  const remove = vi.spyOn(StorageAdapter, 'syncRemove').mockResolvedValue()
  const { deleteSyncedFavoriteData } = await import('../src/utils/favoriteSync')
  await deleteSyncedFavoriteData()
  expect(remove).toHaveBeenCalledWith([
    'wikinote-favorites-sync-v1',
    'wikinote-favorites-sync-v1-chunk-0',
    'wikinote-favorites-sync-v1-chunk-orphan',
  ])
  expect(remove.mock.calls[0]?.[0]).not.toContain('some-unrelated-setting')
  expect(chromeLocal).toEqual({})
})
