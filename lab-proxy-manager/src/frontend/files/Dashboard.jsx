import { useEffect, useState } from 'react'
import { getProxies, getDaemonStatus } from '../api/client'

export default function Dashboard() {
  const [total, setTotal] = useState(0)
  const [daemonStatus, setDaemonStatus] = useState('STOPPED')
  const [lastPing, setLastPing] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [proxiesData, statusData] = await Promise.allSettled([
          getProxies(1, 1),
          getDaemonStatus()
        ])
        if (proxiesData.status === 'fulfilled') {
          setTotal(proxiesData.value?.totalCount ?? 0)
        }
        if (statusData.status === 'fulfilled' && statusData.value) {
          const d = statusData.value
          const running = d.isRunning ?? d.running ?? d.status === 'RUNNING'
          setDaemonStatus(running ? 'RUNNING' : 'STOPPED')
          setLastPing(d.lastPingMs ?? d.lastPing ?? null)
        }
      } catch (e) {
        console.error(e)
      }
    }
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <h1 className="page-title">ОБЗОР СИСТЕМЫ</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Всего прокси</div>
          <div className="stat-value accent">{total.toLocaleString('ru-RU')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Активные пакеты</div>
          <div className="stat-value">8 / 12</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Статус фоновой программы</div>
          <span className={`badge ${daemonStatus === 'RUNNING' ? 'running' : 'stopped'}`}>
            <span className="badge-dot"></span>
            {daemonStatus}
          </span>
          {lastPing && (
            <div className="stat-label">Последний пинг: {lastPing}ms</div>
          )}
        </div>
      </div>
    </div>
  )
}
