import { Link } from 'react-router-dom'

import { formatDateUk } from '../../utils/format'
import './TourCard.css'

type ServiceItem = { key: string; icon: string; label: string }

type BaseProps = {
  title: string
  countryName: string
  cityName: string
  imageUrl: string
  flagUrl?: string
  priceText: string
}

type ListVariantProps = BaseProps & {
  variant: 'list'
  startDate: string
  action: { kind: 'link'; to: string; label: string }
}

type DetailsVariantProps = BaseProps & {
  variant: 'details'
  description?: string
  services?: ServiceItem[]
  dateText: string
  action?: { kind: 'button'; label: string; disabled?: boolean }
}

export type TourCardProps = ListVariantProps | DetailsVariantProps

export function TourCard(props: TourCardProps) {
  if (props.variant === 'details') {
    return (
      <article className="tcCard tcCard--details">
        <header className="tcHeader">
          <div className="tcTitle tcTitle--details">{props.title}</div>
          <div className="tcMeta tcMeta--details">
            <span className="tcLocItem">
              <span className="tcLocIcon" aria-hidden="true">
                🌍
              </span>
              <span>{props.countryName}</span>
            </span>
            <span className="tcLocItem">
              <span className="tcLocIcon" aria-hidden="true">
                📍
              </span>
              <span>{props.cityName}</span>
            </span>
          </div>
        </header>

        <div className="tcHero">
          <img className="tcHeroImg" src={props.imageUrl} alt="" />
        </div>

        <div className="tcBody tcBody--details">
          {props.description ? (
            <section className="tcSection">
              <div className="tcSectionTitle">Опис</div>
              <div className="tcDesc">{props.description}</div>
            </section>
          ) : null}

          {props.services && props.services.length > 0 ? (
            <section className="tcSection">
              <div className="tcSectionTitle">Сервіси</div>
              <div className="tcServices">
                {props.services.map((s) => (
                  <div key={s.key} className="tcServiceItem">
                    <span className="tcServiceIcon" aria-hidden="true">
                      {s.icon}
                    </span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="tcDivider" />

          <div className="tcDatesRow">
            <span className="tcDatesIcon" aria-hidden="true">
              🗓️
            </span>
            <span>{props.dateText}</span>
          </div>

          <footer className="tcFooter">
            <div className="tcFooterPrice">{props.priceText}</div>
            {props.action ? (
              <button
                className="tcFooterBtn"
                type="button"
                disabled={props.action.disabled}
              >
                {props.action.label}
              </button>
            ) : null}
          </footer>
        </div>
      </article>
    )
  }

  return (
    <article className="tcCard tcCard--list">
      <div className="tcImgWrap">
        <img className="tcImg" src={props.imageUrl} alt="" />
      </div>

      <div className="tcBody">
        <div className="tcTitle">{props.title}</div>

        <div className="tcMeta">
          {props.flagUrl ? (
            <img className="tcFlag" src={props.flagUrl} alt="" />
          ) : null}
          <span>
            {props.countryName}, {props.cityName}
          </span>
        </div>

        <div className="tcLabel">Старт туру</div>
        <div className="tcDate">{formatDateUk(props.startDate)}</div>
        <div className="tcPrice">{props.priceText}</div>
        <Link className="tcLink" to={props.action.to}>
          {props.action.label}
        </Link>
      </div>
    </article>
  )
}
