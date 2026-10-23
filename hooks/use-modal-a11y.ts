'use client'

import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/**
 * Shared modal behavior: moves focus into the panel, traps Tab, closes on Escape,
 * locks page scroll (iOS-safe: fixed body keeps the scroll position) and returns
 * focus to the trigger on close.
 */
export function useModalA11y({
  open,
  panelRef,
  onClose,
  returnFocusRef,
}: {
  open: boolean
  panelRef: React.RefObject<HTMLElement | null>
  onClose: () => void
  /** Safari doesn't focus buttons on click, so pass the trigger explicitly when possible */
  returnFocusRef?: React.RefObject<HTMLElement | null>
}) {
  // Callers usually pass an inline onClose; keep the latest without re-running the open effect
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const restoreFocusTo = returnFocusRef?.current ?? (document.activeElement as HTMLElement | null)

    // iOS Safari ignores overflow:hidden on body, so pin the body in place instead
    const scrollY = window.scrollY
    const body = document.body
    const previous = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow }
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'

    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current
      const first = panel?.querySelector<HTMLElement>(FOCUSABLE)
      ;(first ?? panel)?.focus({ preventScroll: true })
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', handleKeyDown)
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.width = previous.width
      body.style.overflow = previous.overflow
      window.scrollTo(0, scrollY)
      restoreFocusTo?.focus({ preventScroll: true })
    }
  }, [open, panelRef, returnFocusRef])
}
