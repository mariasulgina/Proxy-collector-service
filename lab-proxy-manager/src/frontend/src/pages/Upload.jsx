import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const navigate = useNavigate()

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragOut = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files?.[0]?.name.endsWith('.dll')) {
      setUploadStatus('uploading')
      // Здесь будет реальная загрузка через API
      setTimeout(() => {
        setUploadStatus('success')
        setTimeout(() => {
          setUploadStatus(null)
          navigate('/packages')
        }, 1500)
      }, 1000)
    } else {
      setUploadStatus('error')
      setTimeout(() => setUploadStatus(null), 2000)
    }
  }, [navigate])

  const handleClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.dll'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (file?.name.endsWith('.dll')) {
        setUploadStatus('uploading')
        setTimeout(() => {
          setUploadStatus('success')
          setTimeout(() => {
            setUploadStatus(null)
            navigate('/packages')
          }, 1500)
        }, 1000)
      }
    }
    input.click()
  }

  return (
    <div>
      <h1 className="page-title">ЗАГРУЗИТЬ ПАКЕТЫ</h1>
      
      <div
        className={`upload-zone ${isDragging ? 'drag' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>↑</div>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
          Перетащите .dll файл или кликните
        </div>
        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
          Поддерживаются только файлы пакетов (.dll)
        </div>
      </div>
      
      {uploadStatus === 'uploading' && (
        <div className="card" style={{ marginTop: '16px', textAlign: 'center' }}>
          <div className="stat-label">Загрузка...</div>
          <div style={{ 
            width: '100%', 
            height: '4px', 
            background: 'var(--bg3)', 
            borderRadius: '2px',
            marginTop: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '60%',
              height: '100%',
              background: 'var(--accent)',
              animation: 'pulse 1s infinite'
            }}></div>
          </div>
        </div>
      )}
      
      {uploadStatus === 'success' && (
        <div className="card" style={{ marginTop: '16px', textAlign: 'center', borderColor: 'var(--good)' }}>
          <div className="stat-label" style={{ color: 'var(--good)' }}>✓ Пакет успешно добавлен</div>
        </div>
      )}
      
      {uploadStatus === 'error' && (
        <div className="card" style={{ marginTop: '16px', textAlign: 'center', borderColor: 'var(--bad)' }}>
          <div className="stat-label" style={{ color: 'var(--bad)' }}>✗ Ошибка: только .dll файлы</div>
        </div>
      )}
    </div>
  )
}
