import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import type { Hotel, PriceOffer } from '../../api/types'
import { getHotel, getPrice } from '../../api/mockApi'
import { TourCard } from '../../components/TourCard/TourCard'
import {
  formatDateUk,
  formatMoneyUk,
  nightsBetweenInclusive,
} from '../../utils/format'
import { serviceVisual } from '../../utils/hotelServices'

import './TourPage.css'

type Vm = {
  hotel: Hotel
  price: PriceOffer
}

export function TourPage() {
  const [params] = useSearchParams()
  const priceId = params.get('priceId')
  const hotelId = params.get('hotelId')

  const [vm, setVm] = useState<Vm | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        if (!priceId || !hotelId) {
          throw new Error('Не передано параметри туру.')
        }

        const [price, hotel] = await Promise.all([
          getPrice(priceId),
          getHotel(hotelId),
        ])

        if (!hotel?.id) {
          throw new Error('Готель не знайдено.')
        }

        if (cancelled) return
        setError(null)
        setVm({ hotel, price })
      } catch {
        if (cancelled) return
        setVm(null)
        setError('Не вдалося завантажити дані туру.')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [hotelId, priceId])

  const nights = useMemo(() => {
    if (!vm) return 0
    return nightsBetweenInclusive(vm.price.startDate, vm.price.endDate)
  }, [vm])

  const services = useMemo(() => {
    const raw = vm?.hotel.services
    if (!raw) return []
    return Object.entries(raw)
      .map(([k, v]) => {
        const svc = serviceVisual(k)
        if (!svc) return null
        if (!v || v === 'none') return null
        return { key: k, icon: svc.icon, label: svc.label }
      })
      .filter(Boolean) as { key: string; icon: string; label: string }[]
  }, [vm?.hotel.services])

  return (
    <div className="tourPage">
      <div className="tourPageInner">
        <Link className="tourBack" to="/">
          ← Назад до пошуку
        </Link>

        {!priceId || !hotelId ? (
          <div className="tourBanner tourBannerError">
            Не передано параметри туру.
          </div>
        ) : null}

        {error ? (
          <div className="tourBanner tourBannerError">{error}</div>
        ) : null}

        {vm ? (
          <TourCard
            variant="details"
            title={vm.hotel.name}
            countryName={vm.hotel.countryName}
            cityName={vm.hotel.cityName}
            imageUrl={vm.hotel.img}
            priceText={formatMoneyUk(vm.price.amount, vm.price.currency)}
            description={vm.hotel.description}
            services={services}
            dateText={`${formatDateUk(vm.price.startDate)} — ${formatDateUk(vm.price.endDate)}${nights > 0 ? ` (${nights} н.)` : ''}`}
            action={{ kind: 'button', label: 'Відкрити ціну', disabled: true }}
          />
        ) : null}
      </div>
    </div>
  )
}
