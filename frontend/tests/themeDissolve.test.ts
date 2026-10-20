import { describe, expect, it, vi } from 'vitest'
import { dissolveTheme } from '../src/utils/themeDissolve'
function fixture() {
  let finish!: () => void
  let reject!: (error: Error) => void
  const style = { opacity: '0' }
  const finished = new Promise<void>((resolve, fail) => { finish = resolve; reject = fail })
  const opacityAtCancel: string[] = []
  const animation = { finished, cancel: vi.fn(() => { opacityAtCancel.push(style.opacity) }) }
  const node = { style, animate: vi.fn(() => animation) }
  return { node, complete: vi.fn(), finish, reject, animation, opacityAtCancel }
}
describe('theme dissolve handoff', () => {
  it('keeps the underlying scene opaque before releasing the effect and pruning', async () => {
    const f = fixture()
    dissolveTheme(f.node as unknown as HTMLElement, false, f.complete)
    expect(f.node.style.opacity).toBe('1')
    expect(f.complete).not.toHaveBeenCalled()
    f.finish()
    await Promise.resolve()
    expect(f.opacityAtCancel).toEqual(['1'])
    expect(f.complete).toHaveBeenCalledOnce()
    expect(f.animation.cancel.mock.invocationCallOrder[0]).toBeLessThan(f.complete.mock.invocationCallOrder[0])
  })
  it('does not prune after disposal even when completion races with unmount', async () => {
    const f = fixture()
    const dispose = dissolveTheme(f.node as unknown as HTMLElement, false, f.complete)
    f.finish()
    dispose()
    await Promise.resolve()
    expect(f.complete).not.toHaveBeenCalled()
  })
  it('handles cancellation rejection', async () => {
    const f = fixture()
    dissolveTheme(f.node as unknown as HTMLElement, false, f.complete)()
    f.reject(new Error('Canceled'))
    await Promise.resolve()
    expect(f.complete).not.toHaveBeenCalled()
  })
  it('completes reduced motion immediately', () => {
    const f = fixture()
    dissolveTheme(f.node as unknown as HTMLElement, true, f.complete)()
    expect(f.node.style.opacity).toBe('1')
    expect(f.node.animate).not.toHaveBeenCalled()
    expect(f.complete).toHaveBeenCalledOnce()
  })
})
