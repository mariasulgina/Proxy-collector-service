import { useEffect, useState } from 'react'
import { getProxies, getDaemonStatus, pingCollector } from '../api/client'

export default function Dashboard() {
  const [proxies, setProxies] = useState({ totalCount: 0, items: [] })
  const [daemonRaw, setDaemonRaw] = useState(null)
  const [ping, setPing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getProxies(1, 5),
      getDaemonStatus(),
      pingCollector()
    ]).then(([p, d, pi]) => {
      if (p.status === 'fulfilled') setProxies(p.value)
      if (d.status === 'fulfilled') setDaemonRaw(d.value)
      if (pi.status === 'fulfilled') setPing(pi.value)
      setLoading(false)
    })
  }, [])

  const daemon = parseDaemon(daemonRaw)
  const activeCount = proxies.items.filter(p => p.status?.toLowerCase() === 'ok' || p.status?.toLowerCase() === 'active').length

  return (
    <>
      <h1 className="page-title">ОБЗОР СИСТЕМЫ</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Всего прокси</div>
          <div className="stat-value accent">{loading ? '—' : proxies.totalCount.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Активные пакеты</div>
          <div className="stat-value">8 / 12</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Статус прокси</div>
          <div style={{ marginTop: 8 }}>
            <span className={`badge ${daemon.isRunning ? 'running' : 'stopped'}`}>
              <span className="badge-dot" />
              {daemon.isRunning ? 'RUNNING' : 'STOPPED'}
            </span>
            {ping && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
              Последний пинг: {daemon.lastPing ?? '—'}ms
            </div>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Последние прокси</div>
        {loading ? <div style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 13 }}>Загрузка...</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>IP-адрес</th>
                  <th>Порт</th>
                  <th>Протокол</th>
                  <th>Пинг</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {proxies.items.length === 0 ? (
                  <tr><td colSpan={5} style={{ color: 'var(--muted)', textAlign: 'center', padding: 24 }}>Нет прокси</td></tr>
                ) : proxies.items.map(p => (
                  <tr key={p.id}>
                    <td>{p.ip}</td>
                    <td>{p.port}</td>
                    <td>{p.protocol}</td>
                    <td>{p.responseTimeMs}ms</td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase()
  if (s === 'ok' || s === 'active' || s === 'good') return <span className="status-good">● Хорошее</span>
  if (s === 'dead' || s === 'bad' || s === 'error') return <span className="status-bad">● Недоступен</span>
  return <span className="status-unknown">— {status || 'Неизвестно'}</span>
}

function parseDaemon(raw) {
  if (!raw) return { isRunning: false, lastPing: null }
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
    return {
      isRunning: obj.isRunning ?? obj.running ?? false,
      lastPing: obj.lastPingMs ?? obj.lastPing ?? null
    }
  } catch { return { isRunning: false, lastPing: null } }
}
