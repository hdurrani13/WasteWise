import type {
  ActivityEntry,
  Classification,
  CollectionType,
  Item,
  MonthSchedule,
  NextPickups,
  User,
} from '../types'

const TOKEN_KEY = 'ww.token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable: session lasts until reload */
  }
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && typeof init.body === 'string') headers.set('Content-Type', 'application/json')

  const res = await fetch(path, { ...init, headers })
  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = typeof body.detail === 'string' ? body.detail : (body.detail?.[0]?.msg ?? message)
    } catch {
      /* non-JSON error */
    }
    throw new ApiError(res.status, message)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

function query(params: Record<string, string | number | string[] | undefined | null>) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    if (Array.isArray(v)) v.forEach((x) => q.append(k, x))
    else q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const api = {
  register: (email: string, password: string, display_name: string) =>
    request<{ access_token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name }),
    }),

  login: (email: string, password: string) =>
    request<{ access_token: string }>('/api/auth/login', {
      method: 'POST',
      body: new URLSearchParams({ username: email, password }),
    }),

  me: () => request<User>('/api/me'),

  updateMe: (changes: Partial<Omit<User, 'address' | 'id' | 'email'>> & { address?: string }) =>
    request<User>('/api/me', { method: 'PATCH', body: JSON.stringify(changes) }),

  changePassword: (current_password: string, new_password: string) =>
    request<void>('/api/me/password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    }),

  schedule: (year: number, month: number, address?: string | null, types?: CollectionType[]) =>
    request<MonthSchedule>(`/api/schedule${query({ year, month, address, types })}`),

  nextPickups: (address?: string | null, count = 3) =>
    request<NextPickups>(`/api/schedule/next${query({ address, count })}`),

  searchItems: (q: string) => request<Item[]>(`/api/items${query({ q, limit: 12 })}`),

  classify: (text: string) =>
    request<Classification>('/api/items/classify', { method: 'POST', body: JSON.stringify({ text }) }),

  activity: () => request<ActivityEntry[]>('/api/activity'),

  markRead: (id: number) => request<void>(`/api/activity/${id}/read`, { method: 'POST' }),
}
