import { useState, useEffect } from 'react'
import { getProxies, addProxy, deleteProxy } from '../api/client.js'

export default function Proxies() {
  const [items, setItems] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ protocol: '', status: '' })
  const [showAdd, setShowAdd] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const pageSize = 10

  const load = async () => {
    try {
      const data = await getProxies(
        page, pageSize,
        filters.status || null,
        filters.protocol || null
      )
      setItems(data.items ?? [])
      setTotalCount(data.totalCount ?? 0)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [page, filters])

  const toggleOne = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const toggleAll = () =>
    setSelected(selected.length === items.length ? [] : items.map(p => p.id))

  const handleDeleteSelected = async () => {
    for (const id of selected) await deleteProxy(id)
    setSelected([])
    setShowDeleteModal(false)
    load()
  }

  const handleExport = () => {
    const rows = items
      .filter(p => selected.length === 0 || selected.includes(p.id))
      .map(p => `${p.ip}:${p.port}:${p.protocol}:${p.responseTimeMs}ms:${p.status}`)
    navigator.clipboard.writeText(rows.join('\n'))
    alert('Скопировано в буфер обмена')
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div>
      <div className="toolbar">
        <h1 className="page-title">ПРОКСИ</h1>
        <div className="toolbar-actions">
          <button className="btn btn-outline btn-sm" onClick={handleExport}>Экспортировать</button>
          <button className="btn btn-accent btn-sm" onClick={() => setShowAdd(true)}>+ Добавить</button>
          {selected.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteModal(true)}>
              Удалить ({selected.length})
            </button>
          )}
        </div>
      </div>

      <div className="filters">
        <select className="input" value={filters.protocol}
          onChange={e => { setFilters(f => ({ ...f, protocol: e.target.value })); setPage(1) }}>
          <option value="">Все протоколы</option>
          <option value="HTTP">HTTP</option>
          <option value="HTTPS">HTTPS</option>
          <option value="SOCKS5">SOCKS5</option>
          <option value="SOCKS4">SOCKS4</option>
        </select>
        <select className="input" value={filters.status}
          onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1) }}>
          <option value="">Все статусы</option>
          <option value="ok">Хорошее</option>
          <option value="dead">Недоступен</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="checkbox-td">
                <input type="checkbox" onChange={toggleAll}
                  checked={items.length > 0 && selected.length === items.length} />
              </th>
              <th>IP-адрес</th>
              <th>Порт</th>
              <th>Протокол</th>
              <th>Пинг</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0
              ? <tr><td colSpan={6} className="stat-label">Прокси не найдены</td></tr>
              : items.map(p => (
                <tr key={p.id}>
                  <td className="checkbox-td">
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleOne(p.id)} />
                  </td>
                  <td>{p.ip}</td>
                  <td>{p.port}</td>
                  <td>{p.protocol}</td>
                  <td>{p.responseTimeMs}ms</td>
                  <td><StatusCell status={p.status} ping={p.responseTimeMs} /></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span className="page-info">{totalCount} прокси · стр. {page} из {totalPages}</span>
        <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
        <button className={`page-btn active`}>{page}</button>
        <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>›</button>
      </div>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); load() }} />}
      {showDeleteModal && (
        <ConfirmModal
          text={`Удалить ${selected.length} прокси?`}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteSelected}
        />
      )}
    </div>
  )
}

function StatusCell({ status, ping }) {
  const s = (status ?? '').toLowerCase()
  if (s === 'ok' || s === 'active' || ping < 500) return <span className="status-good">● Хорошее</span>
  if (s === 'dead' || s === 'error') return <span className="status-bad">● Недоступен</span>
  return <span className="status-unknown">— {status || '—'}</span>
}

function AddModal({ onClose, onSave }) {
  const [ip, setIp] = useState('')
  const [port, setPort] = useState('')
  const [protocol, setProtocol] = useState('HTTP')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!ip || !port) { setErr('Заполните IP и порт'); return }
    setSaving(true)
    try {
      await addProxy({ ip, port: parseInt(port), protocol })
      onSave()
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Добавить прокси</div>
        <div className="form-group">
          <label className="form-label">IP</label>
          <input className="input" placeholder="192.168.1.1" value={ip} onChange={e => setIp(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Порт</label>
          <input className="input" placeholder="8080" value={port} onChange={e => setPort(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Протокол</label>
          <select className="input" value={protocol} onChange={e => setProtocol(e.target.value)}>
            <option>HTTP</option><option>HTTPS</option><option>SOCKS5</option><option>SOCKS4</option>
          </select>
        </div>
        {err && <div className="form-error">{err}</div>}
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Отмена</button>
          <button className="btn btn-accent" onClick={save} disabled={saving}>Добавить</button>
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ text, onClose, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Подтвердить удаление</div>
        <p className="stat-label">{text}</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Отмена</button>
          <button className="btn btn-danger" onClick={onConfirm}>Подтвердить</button>
        </div>
      </div>
    </div>
  )
}
