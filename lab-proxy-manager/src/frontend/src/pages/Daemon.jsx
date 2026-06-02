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
  
  // Метрики (моковые, обновляются при загрузке)
  const [cpu, setCpu] = useState(15)
  const [ram, setRam] = useState(25)

  const load = useCallback(async () => {
    try {
      const [statusRes, pingRes] = await Promise.allSettled([
        getDaemonStatus(),
        pingCollector()
      ])

      if (statusRes.status === 'fulfilled' && statusRes.value) {
        let data = statusRes.value
        
        while (typeof data === 'string') {
          try { 
            data = JSON.parse(data) 
          } catch (e) { 
            break 
          }
        }

        const isRunningField = data?.isRunning ?? data?.running ?? false
        const rawStatusStr = String(data?.status || data?.Status || '').toUpperCase()
        
        const active = isRunningField === true || rawStatusStr === 'RUNNING'
        
        setIsRunning(active)
        setLastPing(data?.lastPingMs ?? data?.lastPing ?? null)
      } else {
        setIsRunning(false)
      }

      if (pingRes.status === 'fulfilled') {
        setCollectorOnline(!!pingRes.value)
      } else {
        setCollectorOnline(false)
      }

      setIsRunning(prev => {
        if (prev) {
          setCpu(c => Math.min(100, Math.max(5, c + (Math.random() * 10 - 5))))
          setRam(r => Math.min(100, Math.max(10, r + (Math.random() * 8 - 4))))
        } else {
          setCpu(0)
          setRam(0)
        }
        return prev
      })

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
        addLog('Демон запущен', 'success')
      } else if (action === 'stop') {
        await stopDaemon()
        addLog('Демон остановлен', 'success')
      } else if (action === 'restart') {
        await stopDaemon()
        addLog('Остановка...', 'info')
        await new Promise(r => setTimeout(r, 500))
        await startDaemon()
        addLog('Перезапуск выполнен', 'success')
      }
      // Мгновенно обновляем состояние после команды
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
          {/* <span className="stat-label">
            Collector: {collectorOnline ? 'онлайн' : 'недоступен'}
          </span> */}
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
          <div className="flex flex-col resource-block" style={{ flex: 1 }}>
            <div className="stat-label mb-16">CPU</div>
            <div className="flex items-center gap-8">
              <div className="resource-track">
                <div className={`resource-fill ${cpu > 80 ? 'danger' : ''}`} style={{ width: `${cpu}%` }}></div>
              </div>
              <span className="stat-value">{cpu.toFixed(1)}%</span>
            </div>
          </div>
          <div className="flex flex-col resource-block" style={{ flex: 1 }}>
            <div className="stat-label mb-16">RAM</div>
            <div className="flex items-center gap-8">
              <div className="resource-track">
                <div className={`resource-fill ${ram > 80 ? 'danger' : ''}`} style={{ width: `${ram}%` }}></div>
              </div>
              <span className="stat-value">{ram.toFixed(1)}%</span>
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
