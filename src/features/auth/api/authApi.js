import { request } from '../../../helpers/apiHelper.js'

export const login = (email, password) => request('/auth/login', { method: 'POST', body: { email, password } })

export const register = (name, email, password) =>
  request('/auth/register', { method: 'POST', body: { name, email, password } })

export const logout = () => request('/auth/logout', { method: 'POST' })
