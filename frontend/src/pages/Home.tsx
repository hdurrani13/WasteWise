import { ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AddressForm } from '../components/AddressForm'
import { CollectionIcon, Dot } from '../components/CollectionIcon'
import { Header } from '../components/Layout'
import { api } from '../lib/api'
import { COLLECTION_ORDER, groupByDate, monthGrid, parseIso, shiftMonth, todayIso } from '../lib/calendar'
import { COLLECTION_LABELS } from '../lib/i18n'
import { useSession } from '../lib/sessionContext'
import type { CollectionType, MonthSchedule } from '../types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function Home() {
  const { t, hasAddress, scheduleAddress, language } = useSession()
  const today = todayIso()
  const [{ year, month }, setMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  })
  const [filter, setFilter] = useState<CollectionType | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [data, setData] = useState<MonthSchedule | null>(null)
  const [nextDay, setNextDay] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!hasAddress) return
    let cancelled = false
    api
      .schedule(year, month, scheduleAddress)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [year, month, hasAddress, scheduleAddress])

  useEffect(() => {
    if (!hasAddress) return
    api.nextPickups(scheduleAddress, 1).then((n) => setNextDay(n.days[0]?.date ?? null))
  }, [hasAddress, scheduleAddress])

  const byDate = useMemo(() => {
    const pickups = (data?.pickups ?? []).filter((p) => !filter || p.type === filter)
    return groupByDate(pickups)
  }, [data, filter])

  const monthName = new Date(year, month - 1, 1).toLocaleDateString(language, { month: 'long', year: 'numeric' })
  // The card shows the tapped day, or else the next pickup
  const focusDate = selected ?? nextDay
  const focusPickups = focusDate ? (byDate.get(focusDate) ?? []) : []

  if (!hasAddress) {
    return (
      <>
        <Header title={t('home')} />
        <div className="pad">
          <div className="card">
            <p className="lead">{t('needAddress')}</p>
            <AddressForm />
            <p className="fine">{t('addressHelp')}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title={data?.address.display ?? '…'}>
        <div className="month-nav">
          <button aria-label="Previous month" onClick={() => setMonth(shiftMonth(year, month, -1))}>
            <ChevronLeft size={26} />
          </button>
          <h2>{monthName}</h2>
          <button aria-label="Next month" onClick={() => setMonth(shiftMonth(year, month, 1))}>
            <ChevronRight size={26} />
          </button>
        </div>
      </Header>

      <div className="chips" role="group" aria-label="Filter by collection">
        <button className={!filter ? 'chip on' : 'chip'} onClick={() => setFilter(null)}>{t('all')}</button>
        {COLLECTION_ORDER.map((c) => (
          <button key={c} className={filter === c ? 'chip on' : 'chip'} onClick={() => setFilter(filter === c ? null : c)}>
            <Dot type={c} /> {COLLECTION_LABELS[c]}
          </button>
        ))}
      </div>

      {error && <p className="error pad">{error}</p>}

      <div className="calendar" role="grid" aria-label={monthName}>
        {WEEKDAYS.map((d) => (
          <div key={d} className="wd" role="columnheader">{d}</div>
        ))}
        {monthGrid(year, month).map((cell) => {
          const pickups = byDate.get(cell.iso) ?? []
          const cls = ['day', !cell.inMonth && 'out', cell.iso === today && 'today', cell.iso === focusDate && 'sel']
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={cell.iso}
              className={cls}
              role="gridcell"
              aria-label={`${cell.iso}${pickups.length ? ': ' + pickups.map((p) => COLLECTION_LABELS[p.type]).join(', ') : ''}`}
              onClick={() => setSelected(cell.iso === selected ? null : cell.iso)}
            >
              <span className="num">{cell.day}</span>
              <span className="dots">{pickups.map((p) => <Dot key={p.type} type={p.type} />)}</span>
            </button>
          )
        })}
      </div>

      <section className="pad">
        <div className="detail">
          <div className="detail-head">
            <strong>
              {focusDate ? parseIso(focusDate).toLocaleDateString(language, { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
            </strong>
            <span>{selected ? t('pickupReminder') : t('nextPickup')}</span>
          </div>
          {focusPickups.length === 0 ? (
            <p className="muted">{t('noPickup')}</p>
          ) : (
            <ul className="pickup-list">
              {focusPickups.map((p) => (
                <li key={p.type}>
                  <CollectionIcon type={p.type} />
                  <div>
                    <strong>{COLLECTION_LABELS[p.type]}</strong>
                    <span>{p.window}</span>
                    {p.shifted_from && (
                      <em>
                        {t('movedFrom')} {parseIso(p.shifted_from).toLocaleDateString(language, { month: 'short', day: 'numeric' })} ({t('holiday')})
                      </em>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/info" className="btn small">
            <Info size={16} aria-hidden /> {t('moreInfo')}
          </Link>
        </div>
      </section>
    </>
  )
}
