import { MapPin } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useSession } from '../lib/sessionContext'

export function AddressForm({ onDone, submitLabel }: { onDone?: () => void; submitLabel?: string }) {
  const { t, setAddress, addressLabel } = useSession()
  const [value, setValue] = useState(addressLabel ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await setAddress(value)
      onDone?.()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="stack">
      <label className="field">
        <span className="field-label">{t('enterAddress')}</span>
        <span className="input-icon">
          <MapPin size={18} aria-hidden />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="E.g. 1234 567 Ave NW"
            autoComplete="street-address"
            required
          />
        </span>
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy}>
        {submitLabel ?? t('continue')}
      </button>
    </form>
  )
}
