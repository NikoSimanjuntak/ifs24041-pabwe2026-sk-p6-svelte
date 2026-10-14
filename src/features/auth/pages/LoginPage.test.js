import { get } from 'svelte/store'
import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import LoginPage from './LoginPage.svelte'
import * as authApi from '../api/authApi.js'
import { authState, authToken, clearSession, resetAuthState } from '../states/authStore.js'
import { ApiError } from '../../../helpers/apiHelper.js'
import { currentPath } from '../../../lib/navigation.js'
import { deferred, ok, user } from '../../../test/fixtures.js'

vi.mock('../api/authApi.js')

async function fillAndSubmit(u) {
  await u.type(screen.getByLabelText('Email'), 'a@b.co')
  await u.type(screen.getByLabelText('Kata sandi'), 'rahasia')
  await u.click(screen.getByRole('button', { name: /Masuk|Memproses/ }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    clearSession()
    resetAuthState()
  })

  it('berhasil masuk', async () => {
    authApi.login.mockResolvedValue(ok({ token: 'tok', user }, 'Berhasil login'))
    const u = userEvent.setup()
    render(LoginPage)
    await fillAndSubmit(u)
    await waitFor(() => expect(get(authToken)).toBe('tok'))
    expect(authApi.login).toHaveBeenCalledWith('a@b.co', 'rahasia')
  })

  it('menampilkan status memuat', async () => {
    const pending = deferred()
    authApi.login.mockReturnValue(pending.promise)
    const u = userEvent.setup()
    render(LoginPage)
    await fillAndSubmit(u)
    const button = await screen.findByRole('button', { name: 'Memproses...' })
    expect(button).toBeDisabled()
    pending.resolve(ok({ token: 'tok', user }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Masuk' })).toBeEnabled())
  })

  it('menampilkan pesan error saat gagal', async () => {
    authApi.login.mockRejectedValue(new ApiError('Kredensial akun tidak ditemukan'))
    const u = userEvent.setup()
    render(LoginPage)
    await fillAndSubmit(u)
    expect(await screen.findByRole('alert')).toHaveTextContent('Kredensial akun tidak ditemukan')
  })

  it('mereset state saat halaman ditutup', async () => {
    authApi.login.mockRejectedValue(new ApiError('Gagal masuk'))
    const u = userEvent.setup()
    const { unmount } = render(LoginPage)
    await fillAndSubmit(u)
    await screen.findByRole('alert')
    unmount()
    expect(get(authState).error).toBeNull()
  })

  it('tautan daftar mengarah ke halaman register', async () => {
    const u = userEvent.setup()
    render(LoginPage)
    await u.click(screen.getByRole('link', { name: 'Daftar' }))
    expect(get(currentPath)).toBe('/auth/register')
  })
})
