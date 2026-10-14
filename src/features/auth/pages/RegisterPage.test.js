import { get } from 'svelte/store'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import RegisterPage from './RegisterPage.svelte'
import * as authApi from '../api/authApi.js'
import { authState, resetAuthState } from '../states/authStore.js'
import { ApiError } from '../../../helpers/apiHelper.js'
import { currentPath } from '../../../lib/navigation.js'

vi.mock('../api/authApi.js')

async function fillAndSubmit(u) {
  await u.type(screen.getByLabelText('Nama'), 'Delcom Testing')
  await u.type(screen.getByLabelText('Email'), 'testing@delcom.org')
  await u.type(screen.getByLabelText('Kata sandi'), '123456')
  await u.click(screen.getByRole('button', { name: /Daftar|Memproses/ }))
}

describe('RegisterPage', () => {
  beforeEach(() => resetAuthState())

  it('berhasil mendaftar dan mengosongkan form', async () => {
    authApi.register.mockResolvedValue({ status: 'success', message: 'Berhasil melakukan pendaftaran' })
    const u = userEvent.setup()
    render(RegisterPage)
    await fillAndSubmit(u)
    expect(await screen.findByRole('status')).toHaveTextContent('Pendaftaran berhasil')
    expect(authApi.register).toHaveBeenCalledWith('Delcom Testing', 'testing@delcom.org', '123456')
    expect(screen.getByLabelText('Nama')).toHaveValue('')
    expect(screen.getByLabelText('Email')).toHaveValue('')
    expect(screen.getByLabelText('Kata sandi')).toHaveValue('')
  })

  it('menampilkan error dan mempertahankan isian saat gagal', async () => {
    authApi.register.mockRejectedValue(new ApiError('Data tidak valid', { email: ['Sudah dipakai'] }))
    const u = userEvent.setup()
    const { unmount } = render(RegisterPage)
    await fillAndSubmit(u)
    expect(await screen.findByRole('alert')).toHaveTextContent('Data tidak valid: Sudah dipakai')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Nama')).toHaveValue('Delcom Testing')
    unmount()
    expect(get(authState).error).toBeNull()
  })

  it('tautan masuk mengarah ke halaman login', async () => {
    const u = userEvent.setup()
    render(RegisterPage)
    await u.click(screen.getByRole('link', { name: 'Masuk' }))
    expect(get(currentPath)).toBe('/auth/login')
  })
})
