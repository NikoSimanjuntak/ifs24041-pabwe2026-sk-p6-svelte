import { createRawSnippet } from 'svelte'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import LinkTreeLayout from './LinkTreeLayout.svelte'
import * as usersApi from '../../users/api/usersApi.js'
import { authUser, clearSession } from '../../auth/states/authStore.js'
import { resetUsersState } from '../../users/states/usersStore.js'
import { ok, user } from '../../../test/fixtures.js'

vi.mock('../../users/api/usersApi.js')

const children = createRawSnippet(() => ({ render: () => '<p>Konten halaman</p>' }))

describe('LinkTreeLayout', () => {
  beforeEach(() => {
    clearSession()
    resetUsersState()
    usersApi.getProfile.mockResolvedValue(ok({ user }))
  })

  it('membungkus navbar, sidebar, dan konten serta memuat profil', async () => {
    render(LinkTreeLayout, { children })
    expect(screen.getByText('Konten halaman')).toBeInTheDocument()
    expect(screen.getByLabelText('Menu utama')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Semua Link Tree' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Abdullah Ubaid')).toBeInTheDocument())
    expect(usersApi.getProfile).toHaveBeenCalledTimes(1)
  })

  it('tidak memuat ulang profil jika pengguna sudah ada', () => {
    authUser.set(user)
    render(LinkTreeLayout, { children })
    expect(usersApi.getProfile).not.toHaveBeenCalled()
  })

  it('tombol menu membuka dan menu navigasi menutup sidebar', async () => {
    authUser.set(user)
    render(LinkTreeLayout, { children })
    const sidebar = screen.getByLabelText('Menu utama')
    expect(sidebar).toHaveClass('hidden')
    await fireEvent.click(screen.getByRole('button', { name: 'Buka menu' }))
    expect(sidebar).toHaveClass('block')
    await fireEvent.click(screen.getByRole('link', { name: 'Pengguna' }))
    expect(sidebar).toHaveClass('hidden')
  })
})
