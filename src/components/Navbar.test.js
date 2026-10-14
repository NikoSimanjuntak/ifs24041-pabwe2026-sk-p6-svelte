import { get } from 'svelte/store'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import Navbar from './Navbar.svelte'
import * as authApi from '../features/auth/api/authApi.js'
import { authToken, authUser, clearSession } from '../features/auth/states/authStore.js'
import { currentPath } from '../lib/navigation.js'
import { ok, user } from '../test/fixtures.js'

vi.mock('../features/auth/api/authApi.js')

describe('Navbar', () => {
  beforeEach(() => clearSession())

  it('tanpa pengguna menampilkan inisial kosong', () => {
    render(Navbar, { ontoggle: vi.fn() })
    expect(screen.getByText('Delcom Link Tree')).toBeInTheDocument()
    expect(screen.getByLabelText('Logo Delcom Link Tree')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /Foto/ })).not.toBeInTheDocument()
  })

  it('menampilkan nama dan foto pengguna', () => {
    authUser.set(user)
    render(Navbar, { ontoggle: vi.fn() })
    expect(screen.getByText('Abdullah Ubaid')).toBeInTheDocument()
    expect(screen.getByAltText('Foto Abdullah Ubaid')).toHaveAttribute(
      'src',
      'https://open-api.delcom.org/img/profile/1_1709251633.png'
    )
  })

  it('menampilkan inisial jika foto kosong', () => {
    authUser.set({ ...user, photo: '' })
    render(Navbar, { ontoggle: vi.fn() })
    expect(screen.getAllByText('AU').length).toBeGreaterThan(0)
  })

  it('tombol menu memanggil ontoggle', async () => {
    const ontoggle = vi.fn()
    render(Navbar, { ontoggle })
    await fireEvent.click(screen.getByRole('button', { name: 'Buka menu' }))
    expect(ontoggle).toHaveBeenCalledTimes(1)
  })

  it('tombol keluar mengakhiri sesi', async () => {
    authApi.logout.mockResolvedValue(ok(null))
    authToken.set('tok')
    authUser.set(user)
    render(Navbar, { ontoggle: vi.fn() })
    await fireEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    await waitFor(() => expect(get(authToken)).toBeNull())
    expect(authApi.logout).toHaveBeenCalled()
  })

  it('logo mengarah ke beranda', async () => {
    render(Navbar, { ontoggle: vi.fn() })
    await fireEvent.click(screen.getByRole('link', { name: /Delcom Link Tree/ }))
    expect(get(currentPath)).toBe('/')
  })
})
