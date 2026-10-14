import { get } from 'svelte/store'
import * as authApi from '../api/authApi.js'
import {
  authState,
  authToken,
  authUser,
  clearSession,
  isAuthenticated,
  loginUser,
  logoutUser,
  registerUser,
  resetAuthState
} from './authStore.js'
import { ApiError, request } from '../../../helpers/apiHelper.js'
import { getAccessToken, setAccessToken } from '../../../helpers/toolsHelper.js'
import { fetchResponse, ok, user } from '../../../test/fixtures.js'

vi.mock('../api/authApi.js')

describe('authStore', () => {
  beforeEach(() => {
    clearSession()
    resetAuthState()
  })

  it('isAuthenticated mengikuti token', () => {
    expect(get(isAuthenticated)).toBe(false)
    authToken.set('abc')
    expect(get(isAuthenticated)).toBe(true)
  })

  it('loginUser berhasil menyimpan sesi', async () => {
    authApi.login.mockResolvedValue(ok({ token: 'tok', user }, 'Berhasil login'))
    await expect(loginUser({ email: 'a@b.co', password: 'x' })).resolves.toBe(true)
    expect(getAccessToken()).toBe('tok')
    expect(get(authToken)).toBe('tok')
    expect(get(authUser)).toEqual(user)
    expect(get(authState)).toEqual({ loading: false, error: null, message: 'Berhasil login' })
  })

  it('loginUser gagal menyimpan pesan error', async () => {
    authApi.login.mockRejectedValue(new ApiError('Kredensial akun tidak ditemukan'))
    await expect(loginUser({ email: 'a@b.co', password: 'x' })).resolves.toBe(false)
    expect(get(authToken)).toBeNull()
    expect(get(authState).error).toBe('Kredensial akun tidak ditemukan')
  })

  it('registerUser berhasil dan gagal', async () => {
    authApi.register.mockResolvedValueOnce({ status: 'success', message: 'Berhasil melakukan pendaftaran' })
    await expect(registerUser({ name: 'N', email: 'a@b.co', password: 'x' })).resolves.toBe(true)
    expect(get(authState).message).toBe('Berhasil melakukan pendaftaran')

    authApi.register.mockRejectedValueOnce(new ApiError('Data tidak valid', { email: ['Sudah dipakai'] }))
    await expect(registerUser({ name: 'N', email: 'a@b.co', password: 'x' })).resolves.toBe(false)
    expect(get(authState).error).toBe('Data tidak valid: Sudah dipakai')
  })

  it('logoutUser membersihkan sesi walau API berhasil atau gagal', async () => {
    setAccessToken('tok')
    authToken.set('tok')
    authUser.set(user)
    authApi.logout.mockResolvedValueOnce(ok(null))
    await logoutUser()
    expect(get(authToken)).toBeNull()
    expect(get(authUser)).toBeNull()
    expect(getAccessToken()).toBeNull()

    setAccessToken('tok2')
    authToken.set('tok2')
    authApi.logout.mockRejectedValueOnce(new ApiError('Unauthenticated.'))
    await logoutUser()
    expect(get(authToken)).toBeNull()
  })

  it('respons 401 dari server membersihkan sesi', async () => {
    setAccessToken('tok')
    authToken.set('tok')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(fetchResponse({ status: 'fail', message: 'Unauthenticated.' }, { ok: false, status: 401 }))
    )
    await expect(request('/users/me')).rejects.toThrow('Unauthenticated.')
    expect(get(authToken)).toBeNull()
  })

  it('resetAuthState mengembalikan state awal', () => {
    authState.set({ loading: true, error: 'x', message: 'y' })
    resetAuthState()
    expect(get(authState)).toEqual({ loading: false, error: null, message: null })
  })
})
