import type { Bin, CollectionType, Language } from '../types'

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
]

const en = {
  welcome: 'Welcome!',
  getStarted: "Let's get you started",
  signUp: 'Sign Up',
  logIn: 'Log In',
  guest: 'Continue as guest',
  email: 'Email address',
  password: 'Password',
  confirmPassword: 'Confirm password',
  name: 'Name (optional)',
  haveAccount: 'Already have an account?',
  noAccount: "Don't have an account?",
  agreeTerms: 'I agree to the Terms of Service',
  passwordsMismatch: 'Passwords do not match.',
  chooseLanguage: 'Choose your language',
  continue: 'Continue',
  skip: 'Skip',
  enterAddress: 'Enter your home address',
  addressHelp:
    'Your address is only used to find your collection schedule. You can change or remove it any time in Settings.',
  notificationsTitle: 'Get pickup reminders?',
  notificationsBody: "We'll remind you the evening before pickup day. That's it, no ads or extra alerts.",
  allow: 'Allow',
  dontAllow: "Don't allow",
  nextPickup: 'Next pickup',
  pickupReminder: 'Pickup reminder',
  noPickup: 'No pickups on this day.',
  moreInfo: 'More info',
  movedFrom: 'Moved from',
  holiday: 'holiday',
  needAddress: 'To see your calendar, enter your home address.',
  upcoming: 'Upcoming pickups',
  activity: 'Activity',
  activityTitle: 'Your WasteWise activity',
  activityEmpty: 'No activity yet.',
  guestActivity: 'Create an account to get pickup reminders and announcements.',
  home: 'Home',
  sort: 'Sort',
  settings: 'Settings',
  changePassword: 'Change password',
  currentPassword: 'Current password',
  newPassword: 'New password',
  save: 'Save',
  saved: 'Saved',
  darkMode: 'Dark mode',
  language: 'Language',
  notifications: 'Pickup reminders',
  address: 'Address',
  signOut: 'Sign out',
  createAccount: 'Create an account',
  guestUser: 'Guest',
  searchTitle: 'What goes where?',
  searchPlaceholder: 'Search an item, e.g. pizza box',
  notFound: "Not in our list. Here's our best guess:",
  modelNote: 'Predicted by a machine-learning model. Double-check before disposing.',
  confidence: 'confidence',
  featured: 'Common searches',
  all: 'All',
  concept: 'Student redesign concept. Not affiliated with any city.',
}

type Dict = typeof en

const fr: Partial<Dict> = {
  welcome: 'Bienvenue!',
  getStarted: 'Commençons',
  signUp: "S'inscrire",
  logIn: 'Se connecter',
  guest: 'Continuer en invité',
  continue: 'Continuer',
  skip: 'Passer',
  chooseLanguage: 'Choisissez votre langue',
  enterAddress: 'Entrez votre adresse',
  nextPickup: 'Prochaine collecte',
  noPickup: 'Aucune collecte ce jour-là.',
  moreInfo: "Plus d'infos",
  upcoming: 'Collectes à venir',
  activity: 'Activité',
  home: 'Accueil',
  sort: 'Trier',
  settings: 'Paramètres',
  darkMode: 'Mode sombre',
  language: 'Langue',
  signOut: 'Se déconnecter',
  searchTitle: 'Où ça va?',
  all: 'Tout',
}

const es: Partial<Dict> = {
  welcome: '¡Bienvenido!',
  getStarted: 'Empecemos',
  signUp: 'Registrarse',
  logIn: 'Iniciar sesión',
  guest: 'Continuar como invitado',
  continue: 'Continuar',
  skip: 'Omitir',
  chooseLanguage: 'Elige tu idioma',
  enterAddress: 'Ingresa tu dirección',
  nextPickup: 'Próxima recolección',
  noPickup: 'No hay recolección este día.',
  moreInfo: 'Más info',
  upcoming: 'Próximas recolecciones',
  activity: 'Actividad',
  home: 'Inicio',
  sort: 'Clasificar',
  settings: 'Ajustes',
  darkMode: 'Modo oscuro',
  language: 'Idioma',
  signOut: 'Cerrar sesión',
  searchTitle: '¿Dónde va?',
  all: 'Todo',
}

const pa: Partial<Dict> = {
  welcome: 'ਜੀ ਆਇਆਂ ਨੂੰ!',
  continue: 'ਜਾਰੀ ਰੱਖੋ',
  skip: 'ਛੱਡੋ',
  chooseLanguage: 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ',
  home: 'ਘਰ',
  settings: 'ਸੈਟਿੰਗਾਂ',
  activity: 'ਗਤੀਵਿਧੀ',
  language: 'ਭਾਸ਼ਾ',
}

const dictionaries: Record<Language, Partial<Dict>> = { en, fr, es, pa }

export type MessageKey = keyof Dict

export function translate(lang: Language, key: MessageKey): string {
  return dictionaries[lang][key] ?? en[key]
}

export const COLLECTION_LABELS: Record<CollectionType, string> = {
  garbage: 'Garbage',
  food_scraps: 'Food Scraps',
  recycling: 'Recycling',
  yard_waste: 'Yard Waste',
}

export const BIN_LABELS: Record<Bin, string> = {
  recycling: 'Recycling',
  compost: 'Food Scraps / Compost',
  garbage: 'Garbage',
  hazardous: 'Household Hazardous Waste',
  ewaste: 'E-Waste Drop-off',
}
