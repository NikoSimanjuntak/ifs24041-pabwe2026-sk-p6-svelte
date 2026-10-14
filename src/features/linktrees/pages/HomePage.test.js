import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import HomePage from './HomePage.svelte'
import * as linkTreeApi from '../api/linkTreeApi.js'
import { authUser, clearSession } from '../../auth/states/authStore.js'
import { resetLinkTreesState } from '../states/linkTreesStore.js'
import { ApiError } from '../../../helpers/apiHelper.js'
import { currentPath } from '../../../lib/navigation.js'
import { deferred, makeLinkTree, ok, user } from '../../../test/fixtures.js'
import { get } from 'svelte/store'

vi.mock('../api/linkTreeApi.js')

const mine = makeLinkTree({ id: 1, title: 'Kursus Ku', cover: 'http://localhost:8000/img/c.png' })
const others = makeLinkTree({
  id: 2,
  user_id: 2,
  title: 'Catatan Budi',
  type: 'private',
  description: 'Catatan pribadi',
  total_links: 1,
  author: { name: 'Budi Santoso', photo: '' }
})
const unlisted = makeLinkTree({ id: 3, user_id: 2, title: 'Rahasia', type: 'unlisted', total_links: 4 })

const stubConfirm = (answer) => vi.stubGlobal('confirm', vi.fn(() => answer))

describe('HomePage', () => {
  beforeEach(() => {
    clearSession()
    resetLinkTreesState()
    authUser.set(user)
    linkTreeApi.getLinkTrees.mockResolvedValue(ok({ link_trees: [mine, others, unlisted] }))
  })

  it('menampilkan status memuat', async () => {
    const pending = deferred()
    linkTreeApi.getLinkTrees.mockReturnValue(pending.promise)
    render(HomePage)
    expect(await screen.findByText('Memuat link tree...')).toBeInTheDocument()
    pending.resolve(ok({ link_trees: [] }))
  })

  it('menampilkan daftar, statistik, cover, dan placeholder', async () => {
    render(HomePage)
    expect(await screen.findByText('Catatan Budi')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Semua Link Tree' })).toBeInTheDocument()
    expect(screen.getByAltText('Sampul Kursus Ku')).toBeInTheDocument()
    expect(screen.queryByAltText('Sampul Catatan Budi')).not.toBeInTheDocument()

    const stat = (label) => screen.getByText(label).parentElement.querySelector('dd').textContent
    expect(stat('Total Link Tree')).toBe('3')
    expect(stat('Publik')).toBe('1')
    expect(stat('Tidak Terdaftar')).toBe('1')
    expect(stat('Privat')).toBe('1')
    expect(stat('Total Tautan')).toBe('7')
    expect(linkTreeApi.getLinkTrees).toHaveBeenCalledWith(false)
  })

  it('tombol hapus hanya untuk pemilik', async () => {
    render(HomePage)
    await screen.findByText('Catatan Budi')
    expect(screen.getByRole('button', { name: 'Hapus Kursus Ku' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hapus Catatan Budi' })).not.toBeInTheDocument()
  })

  it('tidak menampilkan tombol hapus jika belum ada pengguna', async () => {
    authUser.set(null)
    render(HomePage)
    await screen.findByText('Catatan Budi')
    expect(screen.queryByRole('button', { name: /^Hapus (Kursus|Catatan)/ })).not.toBeInTheDocument()
  })

  it('mencari berdasarkan judul, deskripsi, atau penulis', async () => {
    const u = userEvent.setup()
    render(HomePage)
    await screen.findByText('Catatan Budi')
    const search = screen.getByLabelText('Cari link tree')

    await u.type(search, 'budi')
    expect(screen.getByText('Catatan Budi')).toBeInTheDocument()
    expect(screen.queryByText('Kursus Ku')).not.toBeInTheDocument()

    await u.clear(search)
    await u.type(search, 'zzz-tidak-ada')
    expect(screen.getByText('Tidak ada link tree yang ditemukan.')).toBeInTheDocument()
  })

  it('filter milik saya memuat ulang dengan is_me', async () => {
    const u = userEvent.setup()
    render(HomePage)
    await screen.findByText('Catatan Budi')
    await u.click(screen.getByLabelText('Milik saya'))
    await waitFor(() => expect(linkTreeApi.getLinkTrees).toHaveBeenLastCalledWith(true))
  })

  it('menampilkan error pemuatan', async () => {
    linkTreeApi.getLinkTrees.mockRejectedValue(new ApiError('Gagal memuat data'))
    render(HomePage)
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal memuat data')
  })

  it('judul mengarah ke halaman detail', async () => {
    render(HomePage)
    await fireEvent.click(await screen.findByRole('link', { name: 'Kursus Ku' }))
    expect(get(currentPath)).toBe('/link-trees/1')
  })

  it('menghapus satu link tree setelah konfirmasi', async () => {
    stubConfirm(true)
    linkTreeApi.deleteLinkTree.mockResolvedValue(ok(null, 'Berhasil menghapus data'))
    const u = userEvent.setup()
    render(HomePage)
    await u.click(await screen.findByRole('button', { name: 'Hapus Kursus Ku' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Berhasil menghapus data')
    expect(linkTreeApi.deleteLinkTree).toHaveBeenCalledWith(1)
    await waitFor(() => expect(linkTreeApi.getLinkTrees).toHaveBeenCalledTimes(2))
  })

  it('membatalkan penghapusan satu link tree', async () => {
    stubConfirm(false)
    const u = userEvent.setup()
    render(HomePage)
    await u.click(await screen.findByRole('button', { name: 'Hapus Kursus Ku' }))
    expect(linkTreeApi.deleteLinkTree).not.toHaveBeenCalled()
  })

  it('menampilkan error saat penghapusan gagal tanpa memuat ulang', async () => {
    stubConfirm(true)
    linkTreeApi.deleteLinkTree.mockRejectedValue(new ApiError('Tidak boleh menghapus'))
    const u = userEvent.setup()
    render(HomePage)
    await u.click(await screen.findByRole('button', { name: 'Hapus Kursus Ku' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Tidak boleh menghapus')
    expect(linkTreeApi.getLinkTrees).toHaveBeenCalledTimes(1)
  })

  it('menghapus semua link tree: batal, gagal, dan berhasil', async () => {
    const u = userEvent.setup()
    render(HomePage)
    await screen.findByText('Catatan Budi')
    const button = screen.getByRole('button', { name: 'Hapus Semua' })

    stubConfirm(false)
    await u.click(button)
    expect(linkTreeApi.deleteAllLinkTrees).not.toHaveBeenCalled()

    stubConfirm(true)
    linkTreeApi.deleteAllLinkTrees.mockRejectedValueOnce(new ApiError('Gagal hapus semua'))
    await u.click(button)
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal hapus semua')
    expect(linkTreeApi.getLinkTrees).toHaveBeenCalledTimes(1)

    linkTreeApi.deleteAllLinkTrees.mockResolvedValueOnce(ok(null, 'Berhasil menghapus semua data link tree'))
    await u.click(button)
    expect(await screen.findByRole('status')).toHaveTextContent('Berhasil menghapus semua data link tree')
    await waitFor(() => expect(linkTreeApi.getLinkTrees).toHaveBeenCalledTimes(2))
  })

  it('menambah link tree lewat modal dan memuat ulang daftar', async () => {
    linkTreeApi.createLinkTree.mockResolvedValue(ok({ link_tree_id: 9 }, 'Berhasil menambahkan data'))
    const u = userEvent.setup()
    render(HomePage)
    await screen.findByText('Catatan Budi')
    await u.click(screen.getByRole('button', { name: 'Tambah Link Tree' }))

    const dialog = screen.getByRole('dialog', { name: 'Tambah Link Tree' })
    await u.type(within(dialog).getByLabelText('Judul'), 'Baru')
    await u.type(within(dialog).getByLabelText('Deskripsi'), 'Deskripsi baru')
    await u.click(within(dialog).getByRole('button', { name: 'Simpan' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(linkTreeApi.getLinkTrees).toHaveBeenCalledTimes(2))
    expect(await screen.findByRole('status')).toHaveTextContent('Berhasil menambahkan data')
  })

  it('error tambah hanya tampil di modal, dan modal dapat ditutup', async () => {
    linkTreeApi.createLinkTree.mockRejectedValue(new ApiError('Judul sudah dipakai'))
    const u = userEvent.setup()
    render(HomePage)
    await screen.findByText('Catatan Budi')
    await u.click(screen.getByRole('button', { name: 'Tambah Link Tree' }))
    await u.type(screen.getByLabelText('Judul'), 'Baru')
    await u.type(screen.getByLabelText('Deskripsi'), 'Deskripsi baru')
    await u.click(screen.getByRole('button', { name: 'Simpan' }))

    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(1))
    await u.click(screen.getByRole('button', { name: 'Batal' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
