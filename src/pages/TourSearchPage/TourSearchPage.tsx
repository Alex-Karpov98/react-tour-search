import { TourSearchForm } from '../../widgets/TourSearchForm/TourSearchForm'
import './TourSearchPage.css'

export function TourSearchPage() {
  return (
    <div className="appPage">
      <div className="panel">
        <h1 className="panelTitle">Форма пошуку турів</h1>
        <div className="fieldStack">
          <TourSearchForm />
        </div>
      </div>
    </div>
  )
}
