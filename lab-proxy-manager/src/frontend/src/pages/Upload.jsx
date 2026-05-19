import { useState } from 'react'

export default function Upload() {
  const [drag, setDrag] = useState(false)
  const [file, setFile] = useState(null)

  const onDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer?.files[0] || e.target.files[0]
    if (f) setFile(f)
  }

  return (
    <>
      <h1 className="page-title">ЗАГРУЗИТЬ ПАКЕТ</h1>
      <div className="card">
        <div
          className={`upload-zone ${drag ? 'drag' : ''}`}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input id="file-input" type="file" accept=".dll,.zip,.txt" style={{ display: 'none' }} onChange={onDrop} />
          <div style={{ fontSize: 32, marginBottom: 12 }}>↑</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Перетащите файл или кликните</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Поддерживаются форматы: .dll, .zip, .txt</div>
        </div>

        {file && (
          <div style={{ marginTop: 16, padding: 16, background: 'var(--bg3)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{file.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => setFile(null)}>Отмена</button>
              <button className="btn btn-accent btn-sm" onClick={() => alert('Endpoint не реализован в бэкенде')}>Загрузить</button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, padding: 12, background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.2)', borderRadius: 6, fontSize: 13, color: 'var(--muted)' }}>
          ⚠ Функция загрузки пакетов пока не реализована на бэкенде
        </div>
      </div>
    </>
  )
}
