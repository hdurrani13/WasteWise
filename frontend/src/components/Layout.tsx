import { Bell, House, Search, Settings } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useSession } from '../lib/sessionContext'

export function AppShell() {
  const { t } = useSession()
  const tabs = [
    { to: '/activity', label: t('activity'), icon: Bell },
    { to: '/', label: t('home'), icon: House },
    { to: '/sort', label: t('sort'), icon: Search },
    { to: '/settings', label: t('settings'), icon: Settings },
  ]
  return (
    <div className="shell">
      <main className="screen">
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Main">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
            <Icon size={24} strokeWidth={2.2} aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export function Header({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="header">
      <h1>{title}</h1>
      {children}
    </header>
  )
}

export function Logo({ size = 72 }: { size?: number }) {
  return <img src="/icon.svg" width={size} height={size} alt="" className="logo" />
}
