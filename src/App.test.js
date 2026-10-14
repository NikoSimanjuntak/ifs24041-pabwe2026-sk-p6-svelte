import { get } from 'svelte/store'
import { render, screen, waitFor } from '@testing-library/svelte'
import App from './App.svelte'
import * as linkTreeApi from './features/linktrees/api/linkTreeApi.js'
import * as usersApi from './features/users/api/usersApi.js'
import { authToken, authUser, clearSession } from './features/auth/states/authStore.js'
import { resetLinkTreesState } from './features/linktrees/states/linkTreesStore.js'
import { resetUsersState } from './features/users/states/usersStore.js'
import { currentPath, navigate } from './lib/navigation.js'
import { makeLinkTree, ok, user } from './test/fixtures.js'

vi.mock('./features/linktrees/api/linkTreeApi.js')
vi.mock('./features/users/api/usersApi.js')

function signIn() {
  authToken.set('tok')
  authUser.set(user)
}

describe('App', () => {
  beforeEach(() => {
    clearSession()
    resetLinkTreesState()
    resetUsersState()
    navigate('/', true)
    linkTreeApi.getLinkTrees.mockResolvedValue(ok({ link_trees: [makeLinkTree()] }))
    linkTreeApi.getLinkTree.mockResolvedValue(ok({ link_tree: makeLinkTree() }))
    usersApi.getUsers.mockResolvedValue(ok({ users: [user] }))
    usersApi.getProfile.mockResolvedValue(ok({ user }))
  })

  it('mengarahkan pengguna tamu ke halaman login', async () => {
    render(App)
    expect(await screen.findByRole('heading', { name: 'Masuk' })).toBeInTheDocument()
    expect(get(currentPath)).toBe('/auth/login')
    expect(window.location.pathname).toBe('/auth/login')
  })

  it('menampilkan halaman register untuk tamu', async () => {
    navigate('/auth/register', true)
    render(App)
    expect(await screen.findByRole('heading', { name: 'Daftar' })).toBeInTheDocument()
  })

  it('menampilkan halaman 404 untuk path tidak dikenal', async () => {
    navigate('/tidak-ada', true)
    render(App)
    expect(await screen.findByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument()
  })

  it('pengguna masuk melihat daftar link tree di layout aplikasi', async () => {
    signIn()
    render(App)
    expect(await screen.findByRole('heading', { name: 'Semua Link Tree' })).toBeInTheDocument()
    expect(screen.getByLabelText('Menu utama')).toBeInTheDocument()
  })

  it('pengguna masuk diarahkan keluar dari halaman login', async () => {
    signIn()
    navigate('/auth/login', true)
    render(App)
    expect(await screen.findByRole('heading', { name: 'Semua Link Tree' })).toBeInTheDocument()
    expect(get(currentPath)).toBe('/')
  })

  it('menampilkan halaman detail dengan parameter rute', async () => {
    signIn()
    navigate('/link-trees/1', true)
    render(App)
    expect(await screen.findByRole('heading', { name: 'Kursus Ku' })).toBeInTheDocument()
    expect(linkTreeApi.getLinkTree).toHaveBeenCalledWith('1')
  })

  it('menampilkan halaman pengguna dan profil', async () => {
    signIn()
    navigate('/users', true)
    const { unmount } = render(App)
    expect(await screen.findByRole('heading', { name: 'Pengguna' })).toBeInTheDocument()
    unmount()

    navigate('/profile', true)
    render(App)
    expect(await screen.findByRole('heading', { name: 'Profil' })).toBeInTheDocument()
  })

  it('mengikuti tombol kembali browser (popstate)', async () => {
    signIn()
    render(App)
    await screen.findByRole('heading', { name: 'Semua Link Tree' })
    window.history.pushState(null, '', '/users')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(await screen.findByRole('heading', { name: 'Pengguna' })).toBeInTheDocument()
  })

  it('kembali ke login setelah sesi dibersihkan', async () => {
    signIn()
    render(App)
    await screen.findByRole('heading', { name: 'Semua Link Tree' })
    clearSession()
    await waitFor(() => expect(get(currentPath)).toBe('/auth/login'))
  })
})
