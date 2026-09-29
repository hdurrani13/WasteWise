import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Layout'
import { api } from '../lib/api'
import { useSession } from '../lib/sessionContext'

export function Welcome() {
  const { t, signIn } = useSession()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', agree: false })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) return setError(t('passwordsMismatch'))
    setBusy(true)
    setError('')
    try {
      const { access_token } = await api.register(form.email, form.password, form.name)
      await signIn(access_token)
      navigate('/onboarding')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <Logo />
      <h1>{t('welcome')}</h1>
      <p className="subtitle">{t('getStarted')}</p>
      <form onSubmit={submit} className="stack">
        <input aria-label={t('name')} placeholder={t('name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="email" aria-label={t('email')} placeholder={t('email')} required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" aria-label={t('password')} placeholder={t('password')} minLength={8} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input type="password" aria-label={t('confirmPassword')} placeholder={t('confirmPassword')} required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        <label className="check">
          <input type="checkbox" required checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} />
          <span>{t('agreeTerms')}</span>
        </label>
        {error && <p className="error on-green">{error}</p>}
        <button className="btn light" disabled={busy}>{t('signUp')}</button>
      </form>
      <div className="or"><span>or</span></div>
      <button className="btn ghost" onClick={() => navigate('/onboarding')}>{t('guest')}</button>
      <p className="switch">
        {t('haveAccount')} <Link to="/login">{t('logIn')}</Link>
      </p>
    </div>
  )
}

export function Login() {
  const { t, signIn } = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { access_token } = await api.login(email, password)
      await signIn(access_token)
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <Logo />
      <h1>{t('logIn')}</h1>
      <form onSubmit={submit} className="stack">
        <input type="email" aria-label={t('email')} placeholder={t('email')} required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" aria-label={t('password')} placeholder={t('password')} required value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error on-green">{error}</p>}
        <button className="btn light" disabled={busy}>{t('logIn')}</button>
      </form>
      <p className="switch">
        {t('noAccount')} <Link to="/welcome">{t('signUp')}</Link>
      </p>
    </div>
  )
}
