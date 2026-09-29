import { createContext, useContext } from 'react'
import type { Language, User } from '../types'
import type { MessageKey } from './i18n'

export interface Session {
  user: User | null
  loading: boolean
  isGuest: boolean
  onboarded: boolean
  language: Language
  darkMode: boolean
  /** Address to send to the API: undefined for signed-in users (server uses their saved one). */
  scheduleAddress: string | null | undefined
  hasAddress: boolean
  addressLabel: string | null
  t: (key: MessageKey) => string
  signIn: (token: string) => Promise<void>
  signOut: () => void
  finishOnboarding: () => void
  setLanguage: (l: Language) => Promise<void>
  setDarkMode: (v: boolean) => Promise<void>
  setAddress: (a: string) => Promise<void>
  setNotifications: (v: boolean) => Promise<void>
}

export const SessionContext = createContext<Session | null>(null)

export function useSession(): Session {
  const s = useContext(SessionContext)
  if (!s) throw new Error('useSession must be used inside SessionProvider')
  return s
}
