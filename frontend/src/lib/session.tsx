import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Language, User } from '../types'
import { api, getToken, setToken } from './api'
import { translate } from './i18n'
import { SessionContext, type Session } from './sessionContext'

/** Guests keep their preferences in the browser; signed-in users sync them to the API. */
interface LocalPrefs {
  language: Language
  darkMode: boolean
  address: string | null
  onboarded: boolean
}

const PREFS_KEY = 'ww.prefs'
const DEFAULT_PREFS: LocalPrefs = { language: 'en', darkMode: false, address: null, onboarded: false }

function loadPrefs(): LocalPrefs {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') }
  } catch {
    return DEFAULT_PREFS
  }
}

function savePrefs(p: LocalPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p))
  } catch {
    /* ignore */
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(getToken()))
  const [prefs, setPrefs] = useState<LocalPrefs>(loadPrefs)

  const updatePrefs = useCallback((patch: Partial<LocalPrefs>) => {
    setPrefs((p) => {
      const next = { ...p, ...patch }
      savePrefs(next)
      return next
    })
  }, [])

  useEffect(() => {
    if (!getToken()) return
    api
      .me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const language = user?.language ?? prefs.language
  const darkMode = user?.dark_mode ?? prefs.darkMode

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    document.documentElement.lang = language
  }, [darkMode, language])

  const value = useMemo<Session>(() => {
    const patchUser = async (changes: Parameters<typeof api.updateMe>[0]) => {
      setUser(await api.updateMe(changes))
    }
    return {
      user,
      loading,
      isGuest: !user,
      onboarded: prefs.onboarded || Boolean(user),
      language,
      darkMode,
      scheduleAddress: user ? (user.address ? undefined : null) : prefs.address,
      hasAddress: user ? Boolean(user.address) : Boolean(prefs.address),
      addressLabel: user?.address?.display ?? prefs.address,
      t: (key) => translate(language, key),
      async signIn(token) {
        setToken(token)
        const me = await api.me()
        // Carry guest choices into the new account
        const carry: Parameters<typeof api.updateMe>[0] = {}
        if (!me.address && prefs.address) carry.address = prefs.address
        if (prefs.language !== me.language) carry.language = prefs.language
        if (prefs.darkMode !== me.dark_mode) carry.dark_mode = prefs.darkMode
        setUser(Object.keys(carry).length ? await api.updateMe(carry).catch(() => me) : me)
        updatePrefs({ onboarded: true })
      },
      signOut() {
        setToken(null)
        setUser(null)
        updatePrefs({ onboarded: false })
      },
      finishOnboarding: () => updatePrefs({ onboarded: true }),
      async setLanguage(l) {
        updatePrefs({ language: l })
        if (user) await patchUser({ language: l })
      },
      async setDarkMode(v) {
        updatePrefs({ darkMode: v })
        if (user) await patchUser({ dark_mode: v })
      },
      async setAddress(a) {
        if (user) await patchUser({ address: a })
        else {
          // Validate with the API before saving locally
          const res = await api.nextPickups(a, 1)
          updatePrefs({ address: res.address.display })
        }
      },
      async setNotifications(v) {
        if (user) await patchUser({ notifications_enabled: v })
      },
    }
  }, [user, loading, prefs, language, darkMode, updatePrefs])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
