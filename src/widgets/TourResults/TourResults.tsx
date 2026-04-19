import { useEffect, useMemo, useState } from 'react'
import type { PricesMap } from '../../api/types'
import {
  buildTourCardsVm,
  type TourCardVm,
} from '../../services/tourAggregationService'
import { formatAmountUk, formatDateUk } from '../../utils/format'
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
            <article key={c.priceId} className="tourCard">
              <div className="tourImgWrap">
                <img className="tourImg" src={c.imgUrl} alt="" />
              </div>
              <div className="tourBody">
                <div className="tourTitle">{c.hotelName}</div>
                <div className="tourMeta">
                  {c.flagUrl ? (
                    <img className="tourFlag" src={c.flagUrl} alt="" />
                  ) : null}
                  <span>
                    {c.countryName}, {c.cityName}
                  </span>
                </div>
                <div className="tourLabel">Старт туру</div>
                <div className="tourDate">{formatDateUk(c.startDate)}</div>
                <div className="tourPrice">
                  {formatAmountUk(c.amount)} {c.currency.toUpperCase()}
                </div>
                <a
                  className="tourLink"
                  href={`/tour?priceId=${encodeURIComponent(
                    c.priceId,
                  )}&hotelId=${encodeURIComponent(c.hotelId)}`}
                >
                  Відкрити ціну
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
