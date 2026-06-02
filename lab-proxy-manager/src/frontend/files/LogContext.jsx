import { createContext, useContext, useState, useCallback } from 'react'

const LogContext = createContext()

export function LogProvider({ children }) {
  const [logs, setLogs] = useState([])

  const addLog = useCallback((msg, type = 'info') => {
    setLogs(prev => [
      { time: new Date().toLocaleTimeString(), msg, type },
      ...prev
    ].slice(0, 50))
  }, [])

  const clearLogs = useCallback(() => setLogs([]), [])

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LogContext.Provider>
  )
}

export const useLogs = () => useContext(LogContext)
