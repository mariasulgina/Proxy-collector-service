import { useState, useEffect, useCallback } from 'react'
import { getDaemonStatus, startDaemon, stopDaemon, pingCollector } from '../api/client.js'
import { useLogs } from '../context/LogContext'

export default function Daemon() {
  const { logs, addLog, clearLogs } = useLogs()
  const [isRunning, setIsRunning] = useState(false)
  const [lastPing, setLastPing] = useState(null)
  const [collectorOnline, setCollectorOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [cpu] = useState(() => Math.floor(Math.random() * 30) + 10)
  const [ram] = useState(() => Math.floor(Math.random() * 40) + 20)

  const load = useCallback(async () => {
    try {
      const [statusData, pingData] = await Promise.allSettled([
        getDaemonStatus(),
        pingCollector()
      ])
      if (statusData.status === 'fulfilled' && statusData.value) {
        const d = statusData.value
        const running = d.isRunning ?? d.running ?? d.status === 'RUNNING'
        setIsRunning(running)
        setLastPing(d.lastPingMs ?? d.lastPing ?? null)
      }
      if (pingData.status === 'fulfilled') {
        setCollectorOnline(!!pingData.value)
      }
    } catch (e) {
      addLog(`Ошибка обновления: ${e.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }, [addLog])

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [load])

  const handleAction = async (action) => {
    setActing(true)
    addLog(`Команда: ${action}...`, 'info')
    try {
      if (action === 'start') {
        await startDaemon()
        setIsRunning(true)
        addLog('Демон запущен', 'success')
      } else if (action === 'stop') {
        await stopDaemon()
        setIsRunning(false)
        addLog('Демон остановлен', 'success')
      } else if (action === 'restart') {
        await stopDaemon()
        setIsRunning(false)
        addLog('Демон остановлен, перезапуск...', 'info')
        await new Promise(r => setTimeout(r, 500))
        await startDaemon()
        setIsRunning(true)
        addLog('Демон перезапущен', 'success')
      }
      await load()
    } catch (e) {
      addLog(`Ошибка: ${e.message}`, 'error')
    } finally {
      setActing(false)
    }
  }

  return (
    <div>
      <h1 className="page-title">УПРАВЛЕНИЕ ФОНОВОЙ ПРОГРАММОЙ</h1>

      <div className="card mb-24">
        <div className="card-title">Статус</div>
        <div className="flex items-center gap-12">
          <span className={`badge ${isRunning ? 'running' : 'stopped'}`}>
            <span className="badge-dot"></span>
            {isRunning ? 'RUNNING' : 'STOPPED'}
          </span>
          <span className="stat-label">
            Collector: {collectorOnline ? '● онлайн' : '○ недоступен'}
          </span>
          {lastPing && (
            <span className="stat-label">Пинг: {lastPing}ms</span>
          )}
          {isLoading && <span className="stat-label">• Обновление...</span>}
        </div>
      </div>

      <div className="card mb-24">
        <div className="card-title">Управление</div>
        <div className="daemon-controls">
          <button
            className="btn btn-accent"
            disabled={isRunning || isLoading || acting}
            onClick={() => handleAction('start')}
          >
            ▶ Включить
          </button>
          <button
            className="btn btn-danger"
            disabled={!isRunning || isLoading || acting}
            onClick={() => handleAction('stop')}
          >
            ■ Остановить
          </button>
          <button
            className="btn btn-outline"
            disabled={isLoading || acting}
            onClick={() => handleAction('restart')}
          >
            ↻ Перезагрузить
          </button>
        </div>
      </div>

      <div className="card mb-24">
        <div className="card-title">Мониторинг ресурсов</div>
        <div className="flex gap-24">
          <div className="flex flex-col resource-block">
            <div className="stat-label mb-16">CPU</div>
            <div className="flex items-center gap-8">
              <div className="resource-track">
                <div className={`resource-fill ${cpu > 80 ? 'danger' : ''}`} style={{ width: `${cpu}%` }}></div>
              </div>
              <span className="stat-value">{cpu}%</span>
            </div>
          </div>
          <div className="flex flex-col resource-block">
            <div className="stat-label mb-16">RAM</div>
            <div className="flex items-center gap-8">
              <div className="resource-track">
                <div className={`resource-fill ${ram > 80 ? 'danger' : ''}`} style={{ width: `${ram}%` }}></div>
              </div>
              <span className="stat-value">{ram}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-16">
          <div className="card-title" style={{ margin: 0 }}>Журнал событий</div>
          <button className="btn btn-outline btn-sm" onClick={clearLogs}>Очистить</button>
        </div>
        <div className="log-console">
          {logs.length === 0
            ? <span className="stat-label">Нет записей</span>
            : logs.map((log, i) => (
              <div key={i} className="log-entry">
                <span className="log-time">[{log.time}]</span>
                <span className={`log-msg ${log.type}`}>{log.msg}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
