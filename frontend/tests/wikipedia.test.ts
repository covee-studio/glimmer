import { afterEach, expect, it, vi } from 'vitest'

vi.mock('../src/utils/environment', () => ({ fetchWithCORS: vi.fn() }))
import { fetchWithCORS } from '../src/utils/environment'
import { wikipediaAdapter } from '../src/sources/wikipedia'

afterEach(() => { vi.resetAllMocks(); vi.useRealTimers() })

it('requests disambiguation metadata and excludes ambiguous or unusable summaries', async () => {
  const page = { title: 'A useful subject', extract: 'A substantive introduction. '.repeat(8), pageid: 1, canonicalurl: 'https://en.wikipedia.org/wiki/Example' }
  vi.mocked(fetchWithCORS).mockImplementation(async () => Response.json({ query: { pages: {
    1: page,
    2: { ...page, pageid: 2, pageprops: { disambiguation: '' } },
    3: { ...page, pageid: 3, extract: 'Too short.' },
    4: { ...page, pageid: 4, extract: null },
    5: { ...page, pageid: 5, canonicalurl: '' },
  } } }))
  const result = await wikipediaAdapter.fetch()
  expect(result.map(item => item.id)).toEqual(['wiki-1'])
  expect(String(vi.mocked(fetchWithCORS).mock.calls[0][0])).toContain('ppprop=disambiguation')
})


function pendingUntilAborted(_url: string, options?: RequestInit): Promise<Response> {
  return new Promise((_, reject) => {
    const signal = options?.signal
    if (signal?.aborted) { reject(signal.reason); return }
    signal?.addEventListener('abort', () => reject(signal.reason), { once: true })
  })
}

it('ends a stalled Wikipedia request and clears its deadline', async () => {
  vi.useFakeTimers()
  vi.mocked(fetchWithCORS).mockImplementation(pendingUntilAborted)
  const result = expect(wikipediaAdapter.fetch()).rejects.toThrow('took too long')
  await vi.advanceTimersByTimeAsync(15000)
  await result
  expect(fetchWithCORS).toHaveBeenCalledTimes(1)
  expect(vi.getTimerCount()).toBe(0)
})

it('cancels in-flight Wikipedia requests when their source is left', async () => {
  vi.useFakeTimers()
  vi.mocked(fetchWithCORS).mockImplementation(pendingUntilAborted)
  const controller = new AbortController()
  const result = expect(wikipediaAdapter.fetch({ signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
  controller.abort()
  await result
  expect(fetchWithCORS).toHaveBeenCalledTimes(1)
  expect(vi.getTimerCount()).toBe(0)
})
