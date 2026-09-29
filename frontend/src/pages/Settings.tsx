import { KeyRound, Languages, LogOut, MapPin, Moon, Bell, User as UserIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AddressForm } from '../components/AddressForm'
import { Header } from '../components/Layout'
import { api } from '../lib/api'
import { LANGUAGES } from '../lib/i18n'
import { useSession } from '../lib/sessionContext'
import type { Language } from '../types'

export function Settings() {
  const s = useSession()
  const { t } = s
  const navigate = useNavigate()
  const [open, setOpen] = useState<'address' | 'password' | null>(null)

  return (
    <>
      <Header title={t('settings')} />
      <div className="pad stack">
        <div className="profile">
          <span className="avatar"><UserIcon size={28} aria-hidden /></span>
          <div>
            <strong>{s.user ? s.user.display_name || s.user.email : t('guestUser')}</strong>
            <span>{s.addressLabel ?? '—'}</span>
          </div>
        </div>

        <div className="settings-list">
          <button className="row" onClick={() => setOpen(open === 'address' ? null : 'address')}>
            <MapPin size={20} aria-hidden /> <span>{t('address')}</span>
          </button>
          {open === 'address' && (
            <div className="row-body"><AddressForm submitLabel={t('save')} onDone={() => setOpen(null)} /></div>
          )}

          <label className="row">
            <Languages size={20} aria-hidden /> <span>{t('language')}</span>
            <select value={s.language} onChange={(e) => s.setLanguage(e.target.value as Language)}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </label>

          <label className="row">
            <Moon size={20} aria-hidden /> <span>{t('darkMode')}</span>
            <input type="checkbox" role="switch" className="switch" checked={s.darkMode} onChange={(e) => s.setDarkMode(e.target.checked)} />
          </label>

          {s.user && (
            <>
              <label className="row">
                <Bell size={20} aria-hidden /> <span>{t('notifications')}</span>
                <input type="checkbox" role="switch" className="switch" checked={s.user.notifications_enabled} onChange={(e) => s.setNotifications(e.target.checked)} />
              </label>
              <button className="row" onClick={() => setOpen(open === 'password' ? null : 'password')}>
                <KeyRound size={20} aria-hidden /> <span>{t('changePassword')}</span>
              </button>
              {open === 'password' && <div className="row-body"><PasswordForm onDone={() => setOpen(null)} /></div>}
            </>
          )}
        </div>

        {s.user ? (
          <button className="btn ghost dark" onClick={() => { s.signOut(); navigate('/welcome') }}>
            <LogOut size={18} aria-hidden /> {t('signOut')}
          </button>
        ) : (
          <Link to="/welcome" className="btn">{t('createAccount')}</Link>
        )}
        <p className="fine center">{t('concept')}</p>
      </div>
    </>
  )
}

function PasswordForm({ onDone }: { onDone: () => void }) {
  const { t } = useSession()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [msg, setMsg] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    try {
      await api.changePassword(current, next)
      setMsg(t('saved'))
      setTimeout(onDone, 800)
    } catch (err) {
      setMsg((err as Error).message)
    }
  }

  return (
    <form onSubmit={submit} className="stack">
      <input type="password" placeholder={t('currentPassword')} aria-label={t('currentPassword')} value={current} onChange={(e) => setCurrent(e.target.value)} required />
      <input type="password" placeholder={t('newPassword')} aria-label={t('newPassword')} minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required />
      {msg && <p className="fine">{msg}</p>}
      <button className="btn">{t('save')}</button>
    </form>
  )
}
