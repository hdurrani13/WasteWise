import { ArrowRight, Bell, Check } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AddressForm } from '../components/AddressForm'
import { LANGUAGES } from '../lib/i18n'
import { useSession } from '../lib/sessionContext'

type Step = 'language' | 'address' | 'notifications'

/** Language → address (skippable) → notifications (accounts only), per the redesign's onboarding flow. */
export function Onboarding() {
  const session = useSession()
  const { t } = session
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('language')

  const finish = () => {
    session.finishOnboarding()
    navigate('/')
  }
  const afterAddress = () => (session.isGuest ? finish() : setStep('notifications'))

  return (
    <div className="auth onboarding">
      <div className="steps" aria-hidden>
        {(['language', 'address', ...(session.isGuest ? [] : ['notifications'])] as Step[]).map((s) => (
          <span key={s} className={s === step ? 'on' : ''} />
        ))}
      </div>

      {step === 'language' && (
        <>
          <h1>{t('chooseLanguage')}</h1>
          <ul className="choice-list">
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <button className={session.language === l.code ? 'selected' : ''} onClick={() => session.setLanguage(l.code)}>
                  {l.label}
                  {session.language === l.code && <Check size={18} aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
          <button className="btn light" onClick={() => setStep('address')}>{t('continue')}</button>
        </>
      )}

      {step === 'address' && (
        <>
          <button className="skip" onClick={afterAddress}>
            {t('skip')} <ArrowRight size={18} aria-hidden />
          </button>
          <div className="card">
            <AddressForm onDone={afterAddress} />
            <p className="fine">{t('addressHelp')}</p>
          </div>
        </>
      )}

      {step === 'notifications' && (
        <div className="card center">
          <Bell size={40} className="accent" aria-hidden />
          <h2>{t('notificationsTitle')}</h2>
          <p>{t('notificationsBody')}</p>
          <button className="btn" onClick={() => session.setNotifications(true).then(finish)}>{t('allow')}</button>
          <button className="btn ghost dark" onClick={() => session.setNotifications(false).then(finish)}>{t('dontAllow')}</button>
        </div>
      )}
    </div>
  )
}
