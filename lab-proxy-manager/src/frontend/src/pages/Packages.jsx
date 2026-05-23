import { useState } from 'react'

const MOCK_PACKAGES = [
  { id: 1, name: 'Yandex_Parse_v1', proxies: 5500, connected: true },
  { id: 2, name: 'Google_Parser', proxies: 203, connected: false },
  { id: 3, name: 'Новый пакет', proxies: 0, connected: false, queued: true },
]

export default function Packages() {
  const [packages, setPackages] = useState(MOCK_PACKAGES)

  const togglePackage = (id) => {
    setPackages(pkgs => pkgs.map(p => 
      p.id === id ? { ...p, connected: !p.connected } : p
    ))
  }

  const removePackage = (id) => {
    if (window.confirm('Подтвердить удаление пакета?')) {
      setPackages(pkgs => pkgs.filter(p => p.id !== id))
    }
  }

  return (
    <div>
      <div className="toolbar">
        <h1 className="page-title" style={{ marginBottom: 0 }}>ПАКЕТНЫЙ МЕНЕДЖЕР</h1>
        <button className="btn btn-accent btn-sm" onClick={() => window.location.href = '/upload'}>
          + Добавить
        </button>
      </div>

      <div className="card">
        {packages.map(pkg => (
          <div 
            key={pkg.id} 
            className={`package-item ${pkg.queued ? 'queued' : pkg.connected ? 'connected' : 'disconnected'}`}
          >
            <div>
              <div className="package-name">"{pkg.name}"</div>
              <div className="package-meta">
                {pkg.proxies} прокси
                {pkg.queued && ' • в очереди'}
              </div>
            </div>
            <div className="flex gap-12">
              {!pkg.queued && (
                <button 
                  className={`btn btn-sm ${pkg.connected ? 'btn-danger' : 'btn-outline'}`}
                  onClick={() => togglePackage(pkg.id)}
                >
                  {pkg.connected ? 'Отключить' : 'Подключен'}
                </button>
              )}
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => removePackage(pkg.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
        
        {packages.length === 0 && (
          <div className="stat-label" style={{ textAlign: 'center', padding: '24px' }}>
            Пакеты не установлены
          </div>
        )}
      </div>
    </div>
  )
}
