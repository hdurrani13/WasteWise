import { ChevronLeft, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CollectionIcon } from '../components/CollectionIcon'
import { api } from '../lib/api'
import { parseIso } from '../lib/calendar'
import { COLLECTION_LABELS } from '../lib/i18n'
import { useSession } from '../lib/sessionContext'
import type { NextPickups } from '../types'

export function Info() {
  const { t, scheduleAddress, language } = useSession()
  const [data, setData] = useState<NextPickups | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.nextPickups(scheduleAddress, 3).then(setData).catch((e) => setError(e.message))
  }, [scheduleAddress])

  return (
    <>
      <div className="hero">
        <Link to="/" className="back" aria-label="Back">
          <ChevronLeft size={26} />
        </Link>
        <MapPin size={34} aria-hidden />
        <h1>{data?.address.display ?? '…'}</h1>
        {data && <p>{data.address.zone_name}</p>}
      </div>
      <div className="pad">
        {error && <p className="error">{error}</p>}
        <h2 className="section-title">{t('upcoming')}</h2>
        <div className="upcoming">
          {data?.days.map((day) => (
            <article key={day.date} className="up-card">
              <h3>{parseIso(day.date).toLocaleDateString(language, { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
              {day.pickups.map((p) => (
                <div key={p.type} className="up-row">
                  <CollectionIcon type={p.type} size={20} />
                  <div>
                    <strong>{COLLECTION_LABELS[p.type]}</strong>
                    <span>{p.window}</span>
                  </div>
                </div>
              ))}
            </article>
          ))}
        </div>
      </div>
    </>
  )
}
