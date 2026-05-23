const BASE = '/api'
const API_KEY = import.meta.env.VITE_API_KEY || 'example-api-key'

const headers = {
  'Content-Type': 'application/json',
  'X-Api-Key': API_KEY
}

async function request(path, options = {}) {
  const res = await fetch(BASE + path, { headers, ...options })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  if (res.status === 204) return null
  const text = await res.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}

// Proxies
export const getProxies = (page = 1, pageSize = 10, status = null, protocol = null) => {
  const params = new URLSearchParams({ page, pageSize })
  if (status) params.append('status', status)
  if (protocol) params.append('protocol', protocol)
  return request(`/proxies?${params}`)
}

export const addProxy = (dto) =>
  request('/proxies', { method: 'POST', body: JSON.stringify(dto) })

export const deleteProxy = (id) =>
  request(`/proxies/${id}`, { method: 'DELETE' })

export const pingCollector = () => request('/collector/ping')

export const getDaemonStatus = async () => {
  const raw = await request('/daemon/status')
  const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
  return {
    isRunning: obj.status === 'Running' || obj.status === 'RUNNING'
  }
}

export const startDaemon = () => request('/daemon/start', { method: 'POST' })
export const stopDaemon  = () => request('/daemon/stop',  { method: 'POST' })
