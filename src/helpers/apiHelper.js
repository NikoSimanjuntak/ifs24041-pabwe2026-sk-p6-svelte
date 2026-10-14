import { getAccessToken } from './toolsHelper.js'

export const BASE_URL = import.meta.env.VITE_DELCOM_BASEURL

export class ApiError extends Error {
  constructor(message, fields = {}, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.fields = fields
    this.status = status
  }
}

let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

export function assetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  return `${new URL(BASE_URL).origin}/${path.replace(/^\//, '')}`
}

export async function request(path, { method = 'GET', body, form, query } = {}) {
  const headers = { Accept: 'application/json' }
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let payload
  if (form) {
    payload = form
  } else if (body) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const search = query ? `?${new URLSearchParams(query)}` : ''

  let response
  try {
    response = await fetch(`${BASE_URL}${path}${search}`, { method, headers, body: payload })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server')
  }

  let json
  try {
    json = await response.json()
  } catch {
    json = {}
  }

  if (response.status === 401 && unauthorizedHandler) unauthorizedHandler()

  if (!response.ok || json.status !== 'success') {
    throw new ApiError(json.message ?? 'Terjadi kesalahan pada server', json.data?.field ?? {}, response.status)
  }

  return json
}
