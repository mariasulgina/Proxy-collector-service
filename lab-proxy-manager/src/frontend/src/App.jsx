import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { LogProvider } from './context/LogContext'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Packages from './pages/Packages'
import Proxies from './pages/Proxies'
import Daemon from './pages/Daemon'
import './index.css'

const NAV = [
  { to: '/',         label: 'Дашборд',          icon: '▦' },
  { to: '/upload',   label: 'Загрузить пакет',   icon: '↑' },
  { to: '/packages', label: 'Пакетный менеджер', icon: '⊞' },
  { to: '/proxies',  label: 'Прокси',            icon: '≡' },
  { to: '/daemon',   label: 'Демон',             icon: '⚙' },
]

export default function App() {
  return (
    <LogProvider>
      <BrowserRouter>
        <div className="layout">
          <aside className="sidebar">
            <div className="sidebar-logo">СБОРЩИК ПРОКСИ</div>
            {NAV.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="icon">{icon}</span>
                {label}
              </NavLink>
            ))}
          </aside>
          <main className="main">
            <Routes>
              <Route path="/"         element={<Dashboard />} />
              <Route path="/upload"   element={<Upload />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/proxies"  element={<Proxies />} />
              <Route path="/daemon"   element={<Daemon />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </LogProvider>
  )
}
