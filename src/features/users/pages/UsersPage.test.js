import { render, screen } from '@testing-library/svelte'
import UsersPage from './UsersPage.svelte'
import * as usersApi from '../api/usersApi.js'
import { resetUsersState } from '../states/usersStore.js'
import { ApiError } from '../../../helpers/apiHelper.js'
import { deferred, ok, user } from '../../../test/fixtures.js'

vi.mock('../api/usersApi.js')

describe('UsersPage', () => {
  beforeEach(() => resetUsersState())

  it('menampilkan status memuat', async () => {
    const pending = deferred()
    usersApi.getUsers.mockReturnValue(pending.promise)
    render(UsersPage)
    expect(await screen.findByText('Memuat pengguna...')).toBeInTheDocument()
    pending.resolve(ok({ users: [] }))
  })

  it('menampilkan daftar pengguna dengan foto atau inisial', async () => {
    usersApi.getUsers.mockResolvedValue(
      ok({ users: [user, { id: 2, name: 'Budi Santoso', email: 'budi@delcom.org', photo: '' }] })
    )
    render(UsersPage)
    expect(await screen.findByText('ubaid@delcom.org')).toBeInTheDocument()
    expect(screen.getByAltText('Foto Abdullah Ubaid')).toBeInTheDocument()
    expect(screen.getByText('BS')).toBeInTheDocument()
  })

  it('menampilkan keadaan kosong', async () => {
    usersApi.getUsers.mockResolvedValue(ok({ users: [] }))
    render(UsersPage)
    expect(await screen.findByText('Belum ada pengguna terdaftar.')).toBeInTheDocument()
  })

  it('menampilkan error', async () => {
    usersApi.getUsers.mockRejectedValue(new ApiError('Gagal memuat pengguna'))
    render(UsersPage)
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal memuat pengguna')
  })
})
