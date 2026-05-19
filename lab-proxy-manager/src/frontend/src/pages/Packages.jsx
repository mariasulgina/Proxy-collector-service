import { useState } from 'react'

const MOCK_PACKAGES = [
  { id: 1, name: 'Yandex_Parse_v1', count: 5500, status: 'connected' },
  { id: 2, name: 'Google_Parser', count: 203, status: 'disconnected' },
  { id: 3, name: 'Новый пакет', count: 0, status: 'queued' },
]

export default function Packages() {
  const [packages, setPackages] = useState(MOCK_PACKAGES)
  const [newName, setNewName] = useState('')

  const toggle = (id) => {
    setPackages(ps => ps.map(p => p.id === id
      ? { ...p, status: p.status === 'connected' ? 'disconnected' : 'connected' }
      : p))
  }

  const remove = (id) => setPackages(ps => ps.filter(p => p.id !== id))

  const add = () => {
    if (!newName.trim()) return
    setPackages(ps => [...ps, { id: Date.now(), name: newName, count: 0, status: 'queued' }])
    setNewName('')
  }

  return (
    <>
      <h1 className="page-title">ПАКЕТНЫЙ МЕНЕДЖЕР</h1>

      <div style={{ marginBottom: 12, padding: 12, background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.2)', borderRadius: 6, fontSize: 13, color: 'var(--muted)' }}>
        ⚠ Пакеты работают в демо-режиме — API пакетов не реализован на бэкенде
      </div>

      <div className="card">
        {packages.map(p => (
          <div key={p.id} className={`package-item ${p.status}`}>
            <div>
              <div className="package-name">"{p.name}"</div>
              <div className="package-meta">{p.count > 0 ? `${p.count.toLocaleString()} прокси` : 'в очереди'}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {p.status !== 'queued' && (
                <button className={`btn btn-sm ${p.status === 'connected' ? 'btn-danger' : 'btn-accent'}`} onClick={() => toggle(p.id)}>
                  {p.status === 'connected' ? 'Отключить' : 'Подключить'}
                </button>
              )}
              <button className="btn btn-outline btn-sm" onClick={() => remove(p.id)}>Удалить</button>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input className="input" placeholder="Название нового пакета" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
          <button className="btn btn-accent" onClick={add}>Добавить</button>
        </div>
      </div>
    </>
  )
}
