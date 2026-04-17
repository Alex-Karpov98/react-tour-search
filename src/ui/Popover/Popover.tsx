import { type ReactNode, type RefObject, useEffect, useRef } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
  insideRefs?: RefObject<HTMLElement | null>[]
}

export function Popover({ open, onClose, children, insideRefs }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target
      if (!(target instanceof Node)) return

      const root = rootRef.current
      if (root && root.contains(target)) return

      if (insideRefs?.some((r) => r.current?.contains(target))) return

      onClose()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose, insideRefs])

  if (!open) return null

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      {children}
    </div>
  )
}
