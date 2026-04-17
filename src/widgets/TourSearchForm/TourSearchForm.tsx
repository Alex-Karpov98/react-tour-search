import { type FormEvent, useCallback, useMemo, useRef, useState } from 'react'
import { type GeoItem, getCountries, searchGeo } from '../../api/geo'
import { Combobox } from '../../ui/Combobox/Combobox'
import type { PricesMap } from '../../api/types'
import { runSearchPrices } from '../../services/searchPricesService'
import './TourSearchForm.css'

type Selection = {
  item: GeoItem | null
  inputValue: string
}

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'success'; prices: PricesMap }

export function TourSearchForm() {
  const [selection, setSelection] = useState<Selection>({
    item: null,
    inputValue: '',
  })
  const [searchState, setSearchState] = useState<SearchState>({
    status: 'idle',
  })

  const cacheRef = useRef<Map<string, PricesMap>>(new Map())

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

  const resolvedCountryId = useMemo(() => {
    const item = selection.item
    if (!item) return null
    if (item.kind === 'country') return item.id
    return item.countryId ?? null
  }, [selection.item])

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!resolvedCountryId) {
        setSearchState({
          status: 'error',
          message: 'Будь ласка, оберіть напрямок подорожі.',
        })
        return
      }

      const cached = cacheRef.current.get(resolvedCountryId)
      if (cached) {
        setSearchState(
          Object.keys(cached).length === 0
            ? { status: 'empty' }
            : { status: 'success', prices: cached },
        )
        return
      }

      setSearchState({ status: 'loading' })
      try {
        const prices = await runSearchPrices({ countryId: resolvedCountryId })
        cacheRef.current.set(resolvedCountryId, prices)
        setSearchState(
          Object.keys(prices).length === 0
            ? { status: 'empty' }
            : { status: 'success', prices },
        )
      } catch {
        setSearchState({
          status: 'error',
          message: 'Не вдалося виконати пошук. Спробуйте ще раз.',
        })
      }
    },
    [resolvedCountryId],
  )

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

      <div style={{ height: 12 }} />

      {searchState.status === 'loading' ? (
        <div className="searchStatus">Завантаження…</div>
      ) : null}

      {searchState.status === 'error' ? (
        <div className="searchStatus searchStatusError">
          {searchState.message}
        </div>
      ) : null}

      {searchState.status === 'empty' ? (
        <div className="searchStatus">За вашим запитом турів не знайдено</div>
      ) : null}
    </form>
  )
}
