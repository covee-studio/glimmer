interface ToggleProps {
  checked: boolean
  onChange: () => void
  id?: string
  ariaLabel?: string
}

/** Shared switch treatment for source and preference controls. */
export function Toggle({ checked, onChange, id, ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      id={id}
      onClick={onChange}
      className="ui-switch"
    >
      <span aria-hidden className="ui-switch-thumb" />
    </button>
  )
}
