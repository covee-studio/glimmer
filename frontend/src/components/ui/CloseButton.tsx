import { X } from 'lucide-react'

/** One quiet, keyboard-visible close control across reading panels. */
export function CloseButton({ onClick, label = 'Close' }: { onClick: () => void; label?: string }) {
  return <button type="button" onClick={onClick} className="ui-icon-button ui-close" aria-label={label}><X aria-hidden className="h-4 w-4" strokeWidth={1.7} /></button>
}
