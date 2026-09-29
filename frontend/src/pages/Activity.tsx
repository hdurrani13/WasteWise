import { Bell, Megaphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Layout'
import { api } from '../lib/api'
import { useSession } from '../lib/sessionContext'
import type { ActivityEntry } from '../types'

export function Activity() {
  const { t, isGuest, language } = useSession()
  const [items, setItems] = useState<ActivityEntry[] | null>(null)

  useEffect(() => {
    if (!isGuest) api.activity().then(setItems)
  }, [isGuest])

  async function open(item: ActivityEntry) {
    if (item.read) return
    await api.markRead(item.id)
    setItems((list) => list?.map((a) => (a.id === item.id ? { ...a, read: true } : a)) ?? null)
  }

  return (
    <>
      <Header title={t('activityTitle')} />
      <div className="pad">
        {isGuest ? (
          <div className="card center">
            <Bell size={36} className="accent" aria-hidden />
            <p>{t('guestActivity')}</p>
            <Link to="/welcome" className="btn">{t('createAccount')}</Link>
          </div>
        ) : items?.length === 0 ? (
          <p className="muted">{t('activityEmpty')}</p>
        ) : (
          <ul className="feed">
            {items?.map((a) => (
              <li key={a.id} className={a.read ? 'read' : ''}>
                <button onClick={() => open(a)}>
                  <span className="feed-icon">{a.kind === 'reminder' ? <Bell size={22} /> : <Megaphone size={22} />}</span>
                  <span className="feed-body">
                    <small>{new Date(a.created_at).toLocaleDateString(language, { weekday: 'long', month: 'short', day: 'numeric' })}</small>
                    <strong>{a.title}</strong>
                    <span>{a.body}</span>
                  </span>
                  {!a.read && <span className="unread" aria-label="Unread" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
