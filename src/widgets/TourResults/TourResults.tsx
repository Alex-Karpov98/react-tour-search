import { useEffect, useMemo, useState } from 'react'
import type { PricesMap } from '../../api/types'
import {
  buildTourCardsVm,
  type TourCardVm,
} from '../../services/tourAggregationService'
import { TourCard } from '../../components/TourCard/TourCard'
import { formatMoneyUk } from '../../utils/format'
import { tourDetailsUrl } from '../../utils/routes'
import './TourResults.css'

type Props = {
  countryId: string
  prices: PricesMap
}

export function TourResults({ countryId, prices }: Props) {
  const priceCount = useMemo(() => Object.keys(prices).length, [prices])
  const requestKey = useMemo(() => {
    const ids = Object.keys(prices).sort()
    return `${countryId}:${ids.join(',')}`
  }, [countryId, prices])

  const [state, setState] = useState<
    | { key: string; status: 'ready'; cards: TourCardVm[] }
    | { key: string; status: 'error' }
  >({ key: requestKey, status: 'error' })

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const cards = await buildTourCardsVm({ countryId, prices })
        if (cancelled) return
        setState({ key: requestKey, status: 'ready', cards })
      } catch {
        if (cancelled) return
        setState({ key: requestKey, status: 'error' })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [countryId, prices, requestKey])

  if (priceCount === 0) return null

  const isLoading = state.key !== requestKey

  return (
    <section className="resultsBox" aria-label="Результати пошуку">
      {isLoading ? <div className="resultsStatus">Завантаження…</div> : null}

      {!isLoading && state.status === 'error' ? (
        <div className="resultsStatus resultsStatusError">
          Не вдалося завантажити готелі.
        </div>
      ) : null}

      {!isLoading && state.status === 'ready' ? (
        <div className="cardsGrid">
          {state.cards.map((c) => (
            <TourCard
              key={c.priceId}
              variant="list"
              title={c.hotelName}
              countryName={c.countryName}
              cityName={c.cityName}
              imageUrl={c.imgUrl}
              flagUrl={c.flagUrl}
              startDate={c.startDate}
              priceText={formatMoneyUk(c.amount, c.currency)}
              action={{
                kind: 'link',
                to: tourDetailsUrl(c.priceId, c.hotelId),
                label: 'Відкрити ціну',
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
