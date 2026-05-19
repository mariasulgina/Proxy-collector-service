const BASE = '/api'
const API_KEY = import.meta.env.VITE_API_KEY || 'super_secret_key_777'

const headers = {
  'Content-Type': 'application/json',
  'X-Api-Key': API_KEY
}

async function request(path, options = {}) {
  const res = await fetch(BASE + path, { headers, ...options })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  if (res.status === 204) return null
  return res.json()
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

// Daemon
export const pingCollector = () => request('/collector/ping')
export const getDaemonStatus = () => request('/daemon/status')
export const startDaemon = () => request('/daemon/start', { method: 'POST' })
export const stopDaemon = () => request('/daemon/stop', { method: 'POST' })
