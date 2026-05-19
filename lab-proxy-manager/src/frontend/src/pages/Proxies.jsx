import { useEffect, useState } from 'react'
import { getProxies, addProxy, deleteProxy } from '../api/client'

export default function Proxies() {
  const [data, setData] = useState({ items: [], totalCount: 0 })
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [status, setStatus] = useState('')
  const [protocol, setProtocol] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [showExport, setShowExport] = useState(false)

  const load = () => {
    setLoading(true)
    getProxies(page, pageSize, status || null, protocol || null)
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(load, [page, status, protocol])

  const totalPages = Math.max(1, Math.ceil(data.totalCount / pageSize))

  const toggleAll = (e) => {
    if (e.target.checked) setSelected(new Set(data.items.map(p => p.id)))
    else setSelected(new Set())
  }

  const toggleOne = (id) => {
    const s = new Set(selected)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelected(s)
  }

  const handleDelete = async (id) => {
    await deleteProxy(id)
    setShowDelete(null)
    setSelected(s => { const n = new Set(s); n.delete(id); return n })
    load()
  }

  const handleDeleteSelected = async () => {
    await Promise.all([...selected].map(id => deleteProxy(id)))
    setSelected(new Set())
    load()
  }

  const handleExport = () => {
    const rows = data.items.map(p => `${p.ip}:${p.port}:${p.protocol}:${p.responseTimeMs}ms:${p.status}`)
    const blob = new Blob([rows.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'proxies.txt'; a.click()
    URL.revokeObjectURL(url)
    setShowExport(false)
  }

  return (
    <>
      <h1 className="page-title">ПРОКСИ</h1>

      <div className="card">
        <div className="toolbar">
          <div className="filters" style={{ margin: 0 }}>
            <select className="input" value={protocol} onChange={e => { setProtocol(e.target.value); setPage(1) }}>
              <option value="">Все протоколы</option>
              <option value="HTTP">HTTP</option>
              <option value="HTTPS">HTTPS</option>
              <option value="SOCKS5">SOCKS5</option>
              <option value="SOCKS4">SOCKS4</option>
            </select>
            <select className="input" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
              <option value="">Все статусы</option>
              <option value="ok">Хорошее</option>
              <option value="dead">Недоступен</option>
            </select>
          </div>
          <div className="toolbar-actions">
            <button className="btn btn-accent btn-sm" onClick={() => setShowAdd(true)}>+ Добавить</button>
            <button className="btn btn-outline btn-sm" onClick={() => setShowExport(true)}>Экспортировать</button>
            {selected.size > 0 && (
              <button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>
                Удалить ({selected.size})
              </button>
            )}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" onChange={toggleAll} checked={selected.size === data.items.length && data.items.length > 0} />
                </th>
                <th>IP-адрес</th>
                <th>Порт</th>
                <th>Протокол</th>
                <th>Пинг</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Загрузка...</td></tr>
              ) : data.items.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Нет прокси</td></tr>
              ) : data.items.map(p => (
                <tr key={p.id}>
                  <td className="checkbox-td"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} /></td>
                  <td>{p.ip}</td>
                  <td>{p.port}</td>
                  <td>{p.protocol}</td>
                  <td>{p.responseTimeMs}ms</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => setShowDelete(p)}>Удалить</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="page-info">{data.totalCount} прокси · страница {page} из {totalPages}</span>
          <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const n = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
            return <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
          })}
          <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
        </div>
      </div>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); load() }} />}
      {showDelete && <DeleteModal proxy={showDelete} onClose={() => setShowDelete(null)} onConfirm={() => handleDelete(showDelete.id)} />}
      {showExport && <ExportModal items={data.items} onClose={() => setShowExport(false)} onExport={handleExport} />}
    </>
  )
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase()
  if (s === 'ok' || s === 'active' || s === 'good') return <span className="status-good">● Хорошее</span>
  if (s === 'dead' || s === 'bad' || s === 'error') return <span className="status-bad">● Недоступен</span>
  return <span className="status-unknown">— {status || '—'}</span>
}

function AddModal({ onClose, onSave }) {
  const [form, setForm] = useState({ ip: '', port: '', protocol: 'HTTP' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const save = async () => {
    if (!form.ip || !form.port) { setErr('Заполните IP и порт'); return }
    setSaving(true)
    try {
      await addProxy({ ip: form.ip, port: parseInt(form.port), protocol: form.protocol })
      onSave()
    } catch (e) { setErr(e.message) } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Добавить прокси</div>
        <div className="form-group">
          <label className="form-label">IP</label>
          <input className="input" placeholder="192.168.1.1" value={form.ip} onChange={e => setForm(f => ({ ...f, ip: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Порт</label>
          <input className="input" placeholder="8080" value={form.port} onChange={e => setForm(f => ({ ...f, port: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Протокол</label>
          <select className="input" value={form.protocol} onChange={e => setForm(f => ({ ...f, protocol: e.target.value }))}>
            <option>HTTP</option><option>HTTPS</option><option>SOCKS5</option><option>SOCKS4</option>
          </select>
        </div>
        {err && <div style={{ color: 'var(--danger)', fontSize: 13, fontFamily: 'var(--mono)' }}>{err}</div>}
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Отмена</button>
          <button className="btn btn-accent" onClick={save} disabled={saving}>Добавить</button>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({ proxy, onClose, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Подтвердить удаление</div>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>
          Удалить прокси <span style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>{proxy.ip}:{proxy.port}</span>?
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Отмена</button>
          <button className="btn btn-danger" onClick={onConfirm}>Подтвердить</button>
        </div>
      </div>
    </div>
  )
}

function ExportModal({ items, onClose, onExport }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Экспортировать прокси</div>
        <div style={{ maxHeight: 200, overflow: 'auto', background: 'var(--bg3)', borderRadius: 6, padding: 12 }}>
          {items.map(p => (
            <div key={p.id} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)', marginBottom: 4 }}>
              {p.ip} · {p.port} · {p.protocol} · {p.responseTimeMs}ms · {p.status}
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Отмена</button>
          <button className="btn btn-accent" onClick={onExport}>Экспортировать</button>
        </div>
      </div>
    </div>
  )
}
