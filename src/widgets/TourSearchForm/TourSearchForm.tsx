import { type FormEvent, useCallback, useMemo, useState } from 'react'
import { type GeoItem, getCountries, searchGeo } from '../../api/geo'
import { Combobox } from '../../ui/Combobox/Combobox'

type Selection = {
  item: GeoItem | null
  inputValue: string
}

export function TourSearchForm() {
  const [selection, setSelection] = useState<Selection>({
    item: null,
    inputValue: '',
  })

  const showCountriesOnOpen = useMemo(
    () => selection.item?.kind === 'country' || !selection.item,
    [selection.item],
  )

  const loadItems = useCallback(
    async (query: string, ctx: { source: 'open' | 'input' }) => {
      if (ctx.source === 'open' && showCountriesOnOpen) {
        return await getCountries()
      }
      if (query.trim().length === 0) {
        return showCountriesOnOpen ? await getCountries() : []
      }
      return await searchGeo(query)
    },
    [showCountriesOnOpen],
  )

  const onSubmit = useCallback((e: FormEvent) => {
    e.preventDefault()
  }, [])

  return (
    <form onSubmit={onSubmit}>
      <Combobox
        value={selection.inputValue}
        placeholder="Країна"
        loadItems={loadItems}
        onValueChange={(next) =>
          setSelection((s) => ({ ...s, inputValue: next, item: null }))
        }
        onSelect={(item) => setSelection({ item, inputValue: item.name ?? '' })}
        onClear={() => setSelection({ item: null, inputValue: '' })}
      />

      <div style={{ height: 12 }} />

      <button className="primaryButton" type="submit">
        Знайти
      </button>
    </form>
  )
}
