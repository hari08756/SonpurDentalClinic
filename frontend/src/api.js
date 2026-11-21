const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const isAdminPath = path.startsWith('/api/admin/')
  const isPatientPath = path.startsWith('/api/patient/') && !path.includes('/auth/login') && !path.includes('/auth/register')
  const token = isAdminPath ? localStorage.getItem('sdc_admin_token') : isPatientPath ? localStorage.getItem('sdc_patient_token') : null
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('json') ? await response.json() : await response.text()
  if (!response.ok) {
    // Spring Boot's default error payload includes `error: "Conflict"` as well as a
    // useful `message`. Prefer the human-readable message over the HTTP error label.
    const message = payload?.detail || payload?.message || payload?.title || payload?.error || payload || 'Something went wrong. Please try again.'
    const error = new Error(typeof message === 'string' ? message : 'Request failed')
    error.status = response.status
    throw error
  }
  return payload
}

export async function apiBlob(path) {
  const headers = new Headers()
  const token = localStorage.getItem('sdc_admin_token')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_BASE}${path}`, { headers })
  if (!response.ok) throw new Error('Unable to load the payment screenshot.')
  return response.blob()
}

export const todayString = () => {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

export const formatDate = (value, language = 'en') => value ? new Date(`${value}T00:00:00`).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
export const formatTime = (value) => {
  if (!value) return '—'
  const [rawHour, rawMinute] = String(value).split(':')
  const hour24 = Number(rawHour)
  if (!Number.isFinite(hour24) || !rawMinute) return String(value)
  const hour12 = hour24 % 12 || 12
  const period = hour24 >= 12 ? 'PM' : 'AM'
  return `${hour12}:${String(rawMinute).slice(0, 2).padStart(2, '0')} ${period}`
}
