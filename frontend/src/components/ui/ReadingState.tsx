export function ReadingState({ offline, loading, error, onRetry, onSources }: {
  offline: boolean
  loading: boolean
  error?: string
  onRetry?: () => void
  onSources: () => void
}) {
  if (loading && !offline && !error) return <div role="status" aria-label="Loading reading content" className="reading-loader" style={{ animation: 'zen-breathe 2.6s ease-in-out infinite' }} />
  const heading = offline ? 'A quiet moment, offline.' : error ? 'Content couldn’t be loaded.' : 'Nothing to read just yet.'
  const detail = offline ? 'Reconnect to discover something new. Your saved reading is still here.'
    : error ? 'Try again, or check your reading sources.' : 'Try another batch, or choose a different source.'
  return <section role="status" className="reading-state mx-auto max-w-sm text-center">
    <h2 className="font-serif-editorial text-2xl leading-snug">{heading}</h2>
    <p className="mt-3 text-sm leading-relaxed">{detail}</p>
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      {onRetry && !offline && <button type="button" onClick={onRetry} className="reading-state-action rounded-full px-5 py-2.5 text-sm">{error ? 'Try again' : 'Another batch'}</button>}
      <button type="button" onClick={onSources} className="reading-state-link rounded-full px-4 py-2.5 text-sm">Reading sources</button>
    </div>
  </section>
}
