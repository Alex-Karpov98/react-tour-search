import { useCallback, useId, useMemo, useRef, useState } from 'react'
import { Popover } from '../Popover/Popover'
import './combobox.css'

export type ComboboxItem = {
  id: string
  name: string
  kind: 'country' | 'city' | 'hotel'
  flagUrl?: string
}

type LoadContext = { source: 'open' | 'input' }

type Props<TItem extends ComboboxItem> = {
  value: string
  placeholder?: string
  loadItems: (query: string, ctx: LoadContext) => Promise<TItem[]>
  onValueChange: (next: string) => void
  onSelect: (item: TItem) => void
  onClear: () => void
}

export function Combobox<TItem extends ComboboxItem>({
  value,
  placeholder,
  loadItems,
  onValueChange,
  onSelect,
  onClear,
}: Props<TItem>) {
  const listId = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const inputWrapRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<TItem[]>([])

  const insideRefs = useMemo(() => [inputWrapRef], [])

  const hasValue = value.trim().length > 0

  const icon = useCallback((kind: TItem['kind']) => {
    if (kind === 'country') return '🌍'
    if (kind === 'city') return '📍'
    return '🛏️'
  }, [])

  const load = useCallback(
    async (query: string, ctx: LoadContext) => {
      setLoading(true)
      try {
        const next = await loadItems(query, ctx)
        setItems(next)
      } finally {
        setLoading(false)
      }
    },
    [loadItems],
  )

  const openAndLoad = useCallback(() => {
    setOpen(true)
    void load(value, { source: 'open' })
  }, [load, value])

  const onInputChange = useCallback(
    (next: string) => {
      onValueChange(next)
      if (!open) setOpen(true)
      void load(next, { source: 'input' })
    },
    [onValueChange, open, load],
  )

  const onPick = useCallback(
    (item: TItem) => {
      onSelect(item)
      setOpen(false)
      inputRef.current?.blur()
    },
    [onSelect],
  )

  const statusText = useMemo(() => {
    if (loading) return 'Завантаження…'
    if (items.length === 0) return 'Нічого не знайдено'
    return null
  }, [items.length, loading])

  return (
    <div className="comboRoot">
      <div className="comboInputWrap" ref={inputWrapRef}>
        <input
          ref={inputRef}
          className="comboInput"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={openAndLoad}
          aria-expanded={open}
          aria-controls={listId}
          role="combobox"
          autoComplete="off"
        />
        {hasValue ? (
          <button
            type="button"
            className="comboClear"
            onClick={() => {
              onClear()
              inputRef.current?.focus()
              setOpen(true)
              void load('', { source: 'open' })
            }}
            aria-label="Очистити"
          >
            ×
          </button>
        ) : null}
      </div>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        insideRefs={insideRefs}
      >
        <div className="comboDropdown" role="listbox" id={listId}>
          {statusText ? (
            <div className="comboEmpty">{statusText}</div>
          ) : (
            <ul className="comboList">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="comboItem"
                    onClick={() => onPick(item)}
                  >
                    <span className="comboIcon" aria-hidden="true">
                      {item.kind === 'country' && item.flagUrl ? (
                        <img
                          src={item.flagUrl}
                          alt=""
                          width={18}
                          height={13}
                          style={{ display: 'block', borderRadius: 2 }}
                        />
                      ) : (
                        icon(item.kind)
                      )}
                    </span>
                    <span className="comboLabel">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Popover>
    </div>
  )
}
