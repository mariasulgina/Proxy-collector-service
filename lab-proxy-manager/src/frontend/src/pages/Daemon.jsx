import { useEffect, useState } from 'react'
import { getDaemonStatus, startDaemon, stopDaemon, pingCollector } from '../api/client'

export default function Daemon() {
  const [raw, setRaw] = useState(null)
  const [ping, setPing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)

  const load = () => {
    Promise.allSettled([getDaemonStatus(), pingCollector()]).then(([d, p]) => {
      if (d.status === 'fulfilled') setRaw(d.value)
      if (p.status === 'fulfilled') setPing(p.value)
      setLoading(false)
    })
  }

  useEffect(load, [])

  const daemon = parseDaemon(raw)

  const act = async (fn) => {
    setActing(true)
    try { await fn() } catch (e) { console.error(e) }
    await new Promise(r => setTimeout(r, 800))
    load()
    setActing(false)
  }

  return (
    <>
      <h1 className="page-title">УПРАВЛЕНИЕ ДЕМОНОМ</h1>

      <div className="card mb-24">
        <div className="card-title">Статус</div>
        {loading ? (
          <div style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 13 }}>Загрузка...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span className={`badge ${daemon.isRunning ? 'running' : 'stopped'}`}>
                <span className="badge-dot" />
                {daemon.isRunning ? 'RUNNING' : 'STOPPED'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                Collector: {ping ? '● онлайн' : '○ недоступен'}
              </span>
            </div>
            {raw && (
              <pre style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', background: 'var(--bg3)', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">Управление</div>
        <div className="daemon-controls">
          <button
            className="btn btn-accent"
            onClick={() => act(startDaemon)}
            disabled={acting || daemon.isRunning}
          >
            ▶ Включить
          </button>
          <button
            className="btn btn-danger"
            onClick={() => act(stopDaemon)}
            disabled={acting || !daemon.isRunning}
          >
            ■ Остановить
          </button>
          <button
            className="btn btn-outline"
            onClick={() => act(async () => { await stopDaemon(); await new Promise(r => setTimeout(r, 500)); await startDaemon() })}
            disabled={acting}
          >
            ↺ Перезагрузить
          </button>
        </div>
      </div>
    </>
  )
}

function parseDaemon(raw) {
  if (!raw) return { isRunning: false }
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
    return { isRunning: obj.isRunning ?? obj.running ?? false }
  } catch { return { isRunning: false } }
}
