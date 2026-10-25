import { useState } from 'react'
import { BookOpen } from 'lucide-react'

/** Reserve the artwork's space and never expose a browser broken-image glyph.
 * Track the URL, so a reused list row can recover when its image changes. */
export function ResilientImage({ src, alt = '', className = '', contain = false }: {
  src?: string
  alt?: string
  className?: string
  contain?: boolean
}) {
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const loaded = Boolean(src && loadedUrl === src && failedUrl !== src)
  return <span className={`ui-image relative inline-flex shrink-0 items-center justify-center overflow-hidden ${className}`}>
    {!loaded && <BookOpen aria-hidden className="h-4 w-4 text-[var(--ui-muted)] opacity-65" strokeWidth={1.5} />}
    {src && failedUrl !== src && <img src={src} alt={alt} decoding="async"
      onLoad={() => setLoadedUrl(src)} onError={() => setFailedUrl(src)}
      className={`absolute inset-0 h-full w-full ${contain ? 'object-contain' : 'object-cover'} ${loaded ? 'opacity-100' : 'opacity-0'}`} />}
  </span>
}
