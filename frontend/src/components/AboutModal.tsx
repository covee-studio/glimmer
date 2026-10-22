import { CloseButton } from './ui/CloseButton'
import { usePanelMotion } from './ui/usePanelMotion'
import { motion, AnimatePresence } from 'motion/react'
import { useI18n } from '../hooks/useI18n'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useRef } from 'react'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { t } = useI18n()
  const panelMotion = usePanelMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  useKeyboardNavigation({ onEscape: onClose, enabled: isOpen })
  useFocusTrap(isOpen, containerRef)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="about-backdrop"
          {...panelMotion.backdrop}
          className="fixed inset-0 ui-modal-backdrop z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
        >
          <motion.div
            {...panelMotion.panel}
            className="reading-panel z-[41] p-5 sm:p-7 max-h-[92dvh] overflow-y-auto overscroll-contain w-full max-w-md flex flex-col relative"
            role="document"
            ref={containerRef}
          >
            {/* Header */}
            <div className="ui-panel-header">
              <h2 id="about-title" className="ui-panel-title font-serif-editorial">{t('about.title')}</h2>
              <CloseButton onClick={onClose} label={t("common.close")} />
            </div>

            {/* Body */}
            <div className="font-serif-editorial flex flex-col gap-2.5 text-[15px] text-[var(--ui-text)] leading-[1.75]">
              <p>A new tab is usually just a moment between things.</p>
              <p>
                Glimmer puts something there — one article, quietly chosen at random.
                Wikipedia, Hacker News, or your own notes.
              </p>
              <p>You can skip it. Or you can stay a while.</p>
              <p>Either way, it's a chance to meet something you didn't know you were curious about.</p>

              <p className="text-slate-300 select-none">—</p>

              <p>
                This started as a fork of{' '}
                <a
                  href="https://github.com/IsaacGemal/wikitok"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ui-ink)] font-medium hover:underline"
                >
                  wikitok
                </a>
                {' '}by{' '}
                <a
                  href="https://github.com/IsaacGemal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ui-ink)] font-medium hover:underline"
                >
                  IsaacGemal
                </a>
                , and was shaped along the way by{' '}
                <a
                  href="https://github.com/liminalpurr/jizhi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ui-ink)] font-medium hover:underline"
                >
                  几枝
                </a>
                . They made me think harder about what a new tab could be.
              </p>
              <p>Hope you enjoy it.</p>

              <div className="font-sans pt-4 border-t border-[var(--ui-line-soft)] mt-1 flex items-center gap-4">
                <a
                  href="https://github.com/covee-studio/glimmer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ui-muted)] hover:text-[var(--ui-ink)] transition-colors font-medium"
                >
                  GitHub
                </a>
                <span className="text-slate-200 select-none">·</span>
                <a
                  href="https://buymeacoffee.com/exploreryer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ui-muted)] hover:text-[var(--ui-ink)] transition-colors font-medium"
                >
                  {t('about.buyMeCoffee')} ☕
                </a>
              </div>
            </div>
          </motion.div>

          <div
            className="w-full h-full z-[40] fixed inset-0"
            onClick={onClose}
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
