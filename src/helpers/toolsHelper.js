const TOKEN_KEY = 'delcom_link_tree_token'

export const LINK_TREE_TYPES = [
  { value: 'public', label: 'Publik' },
  { value: 'unlisted', label: 'Tidak Terdaftar' },
  { value: 'private', label: 'Privat' }
]

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeAccessToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

export function typeLabel(type) {
  const found = LINK_TREE_TYPES.find((item) => item.value === type)
  return found ? found.label : type
}

export function hasCover(cover) {
  return Boolean(cover) && !cover.endsWith('/')
}

export function isValidHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function describeError(error) {
  const details = Object.values(error.fields ?? {})
    .flat()
    .join(', ')
  return details ? `${error.message}: ${details}` : error.message
}
