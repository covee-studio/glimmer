import { useReducedMotion } from 'motion/react'

/** Utility panels share a restrained entrance; theme transitions stay separate. */
export function usePanelMotion() {
  const reduced = useReducedMotion()
  return {
    backdrop: {
      // Resolve the blur to zero while still mounted, rather than tearing down
      // a full-screen blurred compositor surface at the end of the fade.
      initial: { opacity: 0, backdropFilter: 'blur(0px)' },
      animate: { opacity: 1, backdropFilter: 'blur(4px)' },
      exit: { opacity: 0, backdropFilter: 'blur(0px)' },
      transition: { duration: reduced ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] as const },
    },
    view: {
      initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 },
      transition: { duration: reduced ? 0 : 0.16 },
    },
    panel: {
      initial: { opacity: 0, y: reduced ? 0 : 6 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: reduced ? 0 : 3, transition: { duration: reduced ? 0 : 0.14 } },
      transition: { duration: reduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] as const },
    },
  }
}
