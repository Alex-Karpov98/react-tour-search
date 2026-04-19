import { useCallback, useState } from 'react'
import type { PricesMap } from '../../api/types'
import { TourResults } from '../../widgets/TourResults/TourResults'
import { TourSearchForm } from '../../widgets/TourSearchForm/TourSearchForm'
import './TourSearchPage.css'

export function TourSearchPage() {
  const [results, setResults] = useState<{
    countryId: string
    prices: PricesMap
  } | null>(null)

  const onSuccess = useCallback(
    (args: { countryId: string; prices: PricesMap }) => {
      setResults(args)
    },
    [],
  )

  const onEmpty = useCallback(() => {
    setResults(null)
  }, [])

  return (
    <div className="appPage">
      <div className="pageStack">
        <div className="panel">
          <h1 className="panelTitle">Форма пошуку турів</h1>
          <div className="fieldStack">
            <TourSearchForm onSuccess={onSuccess} onEmpty={onEmpty} />
          </div>
        </div>

        {results ? (
          <TourResults countryId={results.countryId} prices={results.prices} />
        ) : null}
      </div>
    </div>
  )
}
