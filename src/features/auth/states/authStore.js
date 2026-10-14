import { derived, writable } from 'svelte/store'
import * as authApi from '../api/authApi.js'
import { setUnauthorizedHandler } from '../../../helpers/apiHelper.js'
import {
  describeError,
  getAccessToken,
  removeAccessToken,
  setAccessToken
} from '../../../helpers/toolsHelper.js'

const initialState = () => ({ loading: false, error: null, message: null })

export const authToken = writable(getAccessToken())
export const authUser = writable(null)
export const authState = writable(initialState())
export const isAuthenticated = derived(authToken, (token) => Boolean(token))

export function resetAuthState() {
  authState.set(initialState())
}

export function clearSession() {
  removeAccessToken()
  authToken.set(null)
  authUser.set(null)
}

// Token kedaluwarsa/tidak valid dari server -> sesi lokal dibersihkan.
setUnauthorizedHandler(clearSession)

export async function loginUser({ email, password }) {
  authState.set({ loading: true, error: null, message: null })
  try {
    const response = await authApi.login(email, password)
    setAccessToken(response.data.token)
    authToken.set(response.data.token)
    authUser.set(response.data.user)
    authState.set({ loading: false, error: null, message: response.message })
    return true
  } catch (error) {
    authState.set({ loading: false, error: describeError(error), message: null })
    return false
  }
}

export async function registerUser({ name, email, password }) {
  authState.set({ loading: true, error: null, message: null })
  try {
    const response = await authApi.register(name, email, password)
    authState.set({ loading: false, error: null, message: response.message })
    return true
  } catch (error) {
    authState.set({ loading: false, error: describeError(error), message: null })
    return false
  }
}

export async function logoutUser() {
  try {
    await authApi.logout()
  } catch {
    // Sesi lokal tetap dihapus walaupun token sudah tidak valid di server.
  }
  clearSession()
}
