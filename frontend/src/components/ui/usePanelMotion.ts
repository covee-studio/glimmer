import { useReducedMotion } from 'motion/react'

/** Utility panels share a restrained entrance; theme transitions stay separate. */
export function usePanelMotion() {
  const reduced = useReducedMotion()
  return {
    backdrop: {
      initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 },
      transition: { duration: reduced ? 0 : 0.18 },
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
