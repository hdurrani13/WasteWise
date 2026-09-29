import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/Layout'
import { useSession } from './lib/sessionContext'
import { Activity } from './pages/Activity'
import { Home } from './pages/Home'
import { Info } from './pages/Info'
import { Onboarding } from './pages/Onboarding'
import { Search } from './pages/Search'
import { Settings } from './pages/Settings'
import { Login, Welcome } from './pages/Welcome'

function RequireOnboarding({ children }: { children: ReactNode }) {
  const { onboarded, loading } = useSession()
  if (loading) return null
  return onboarded ? children : <Navigate to="/welcome" replace />
}

export default function App() {
  return (
    <div className="device">
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          element={
            <RequireOnboarding>
              <AppShell />
            </RequireOnboarding>
          }
        >
          <Route index element={<Home />} />
          <Route path="info" element={<Info />} />
          <Route path="activity" element={<Activity />} />
          <Route path="sort" element={<Search />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
