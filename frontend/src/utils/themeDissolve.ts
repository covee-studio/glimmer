/** Keep the underlying style opaque when the browser releases the animation. */
export function dissolveTheme(node: HTMLElement, reducedMotion: boolean, onComplete: () => void) {
  node.style.opacity = '1'
  if (reducedMotion) {
    onComplete()
    return () => {}
  }

  let disposed = false
  const animation = node.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 800,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'both',
  })
  void animation.finished.then(() => {
    if (disposed) return
    // Write the final DOM style before canceling the fill effect or pruning
    // outgoing scenes. A scheduled React/Motion render leaves a one-frame gap.
    node.style.opacity = '1'
    animation.cancel()
    onComplete()
  }, () => { /* Unmounting/StrictMode cancels the animation. */ })

  return () => {
    disposed = true
    animation.cancel()
  }
}
