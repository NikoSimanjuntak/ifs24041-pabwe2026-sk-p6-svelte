import { get } from 'svelte/store'
import { render, screen, waitFor, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import DetailPage from './DetailPage.svelte'
import * as linkTreeApi from '../api/linkTreeApi.js'
import { authUser, clearSession } from '../../auth/states/authStore.js'
import { resetLinkTreesState } from '../states/linkTreesStore.js'
import { ApiError } from '../../../helpers/apiHelper.js'
import { currentPath } from '../../../lib/navigation.js'
import { deferred, makeLinkTree, ok, user } from '../../../test/fixtures.js'

vi.mock('../api/linkTreeApi.js')

const params = { linkTreeId: '1' }
const stubConfirm = (answer) => vi.stubGlobal('confirm', vi.fn(() => answer))

describe('DetailPage', () => {
  beforeEach(() => {
    clearSession()
    resetLinkTreesState()
    authUser.set(user)
    linkTreeApi.getLinkTree.mockResolvedValue(ok({ link_tree: makeLinkTree() }))
  })

  it('menampilkan status memuat', async () => {
    const pending = deferred()
    linkTreeApi.getLinkTree.mockReturnValue(pending.promise)
    render(DetailPage, { params })
    expect(await screen.findByText('Memuat detail link tree...')).toBeInTheDocument()
    pending.resolve(ok({ link_tree: makeLinkTree() }))
  })

  it('menampilkan detail beserta tautan untuk pemilik', async () => {
    render(DetailPage, { params })
    expect(await screen.findByRole('heading', { name: 'Kursus Ku' })).toBeInTheDocument()
    expect(linkTreeApi.getLinkTree).toHaveBeenCalledWith('1')
    expect(screen.getByText('Kumpulan kursus favorit')).toBeInTheDocument()
    expect(screen.getByText('Publik')).toBeInTheDocument()
    expect(screen.getByText(/dibuat 9 Maret 2025/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'https://youtu.be/uHyfQV0kbgo' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('button', { name: 'Ubah Data' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tambah Tautan' })).toBeInTheDocument()
  })

  it('menampilkan cover jika tersedia', async () => {
    linkTreeApi.getLinkTree.mockResolvedValue(
      ok({ link_tree: makeLinkTree({ cover: 'http://localhost:8000/img/cover.png' }) })
    )
    render(DetailPage, { params })
    expect(await screen.findByAltText('Sampul Kursus Ku')).toBeInTheDocument()
  })

  it('menyembunyikan aksi untuk bukan pemilik dan menampilkan keadaan tanpa tautan', async () => {
    authUser.set({ ...user, id: 99 })
    linkTreeApi.getLinkTree.mockResolvedValue(ok({ link_tree: makeLinkTree({ items: [] }) }))
    render(DetailPage, { params })
    expect(await screen.findByText('Belum ada tautan.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ubah Data' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tambah Tautan' })).not.toBeInTheDocument()
  })

  it('bukan pemilik tidak melihat tombol ubah dan hapus tautan', async () => {
    authUser.set({ ...user, id: 99 })
    render(DetailPage, { params })
    await screen.findByRole('heading', { name: 'Kursus Ku' })
    expect(screen.queryByRole('button', { name: 'Ubah Dasar Java' })).not.toBeInTheDocument()
  })

  it('tanpa pengguna tidak dianggap pemilik', async () => {
    authUser.set(null)
    render(DetailPage, { params })
    await screen.findByRole('heading', { name: 'Kursus Ku' })
    expect(screen.queryByRole('button', { name: 'Ubah Data' })).not.toBeInTheDocument()
  })

  it('menampilkan error pemuatan', async () => {
    linkTreeApi.getLinkTree.mockRejectedValue(new ApiError('Link tree tidak ditemukan'))
    render(DetailPage, { params })
    expect(await screen.findByRole('alert')).toHaveTextContent('Link tree tidak ditemukan')
  })

  it('tautan kembali mengarah ke beranda', async () => {
    const u = userEvent.setup()
    render(DetailPage, { params })
    await u.click(await screen.findByRole('link', { name: /Kembali ke semua link tree/ }))
    expect(get(currentPath)).toBe('/')
  })

  it('mengubah data lewat modal', async () => {
    linkTreeApi.updateLinkTree.mockResolvedValue(ok(null, 'Berhasil mengubah data'))
    const u = userEvent.setup()
    render(DetailPage, { params })
    await u.click(await screen.findByRole('button', { name: 'Ubah Data' }))
    const dialog = screen.getByRole('dialog', { name: 'Ubah Link Tree' })
    await u.click(within(dialog).getByRole('button', { name: 'Simpan perubahan' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(linkTreeApi.getLinkTree).toHaveBeenCalledTimes(2))
    expect(screen.getByRole('status')).toHaveTextContent('Berhasil mengubah data')
  })

  it('mengubah sampul lewat modal dan dapat dibatalkan', async () => {
    linkTreeApi.changeCover.mockResolvedValue(ok(null, 'Berhasil mengubah cover'))
    const u = userEvent.setup()
    render(DetailPage, { params })
    await u.click(await screen.findByRole('button', { name: 'Ubah Sampul' }))
    await u.click(screen.getByRole('button', { name: 'Batal' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await u.click(screen.getByRole('button', { name: 'Ubah Sampul' }))
    await u.upload(screen.getByLabelText('Berkas sampul'), new File(['x'], 'c.png', { type: 'image/png' }))
    await u.click(screen.getByRole('button', { name: 'Unggah' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(linkTreeApi.changeCover).toHaveBeenCalledWith(1, expect.any(File))
  })

  it('menambah tautan baru', async () => {
    linkTreeApi.addItem.mockResolvedValue(ok({ item_id: 11 }, 'Berhasil menambahkan data'))
    const u = userEvent.setup()
    render(DetailPage, { params })
    await u.click(await screen.findByRole('button', { name: 'Tambah Tautan' }))
    await u.type(screen.getByLabelText('Judul tautan'), 'Delcom')
    await u.type(screen.getByLabelText('URL'), 'https://delcom.org')
    await u.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(linkTreeApi.addItem).toHaveBeenCalledWith(1, { title: 'Delcom', url: 'https://delcom.org' })
  })

  it('mengubah tautan yang ada', async () => {
    linkTreeApi.updateItem.mockResolvedValue(ok(null, 'Berhasil mengubah data'))
    const u = userEvent.setup()
    render(DetailPage, { params })
    await u.click(await screen.findByRole('button', { name: 'Ubah Dasar Java' }))
    expect(screen.getByLabelText('Judul tautan')).toHaveValue('Dasar Java')
    await u.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(linkTreeApi.updateItem).toHaveBeenCalledWith(1, 10, expect.any(Object)))
  })

  it('menghapus tautan: batal, gagal, berhasil', async () => {
    const u = userEvent.setup()
    render(DetailPage, { params })
    const button = await screen.findByRole('button', { name: 'Hapus Dasar Java' })

    stubConfirm(false)
    await u.click(button)
    expect(linkTreeApi.deleteItem).not.toHaveBeenCalled()

    stubConfirm(true)
    linkTreeApi.deleteItem.mockRejectedValueOnce(new ApiError('Gagal hapus tautan'))
    await u.click(button)
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal hapus tautan')
    expect(linkTreeApi.getLinkTree).toHaveBeenCalledTimes(1)

    linkTreeApi.deleteItem.mockResolvedValueOnce(ok(null, 'Berhasil menghapus data'))
    await u.click(button)
    await waitFor(() => expect(linkTreeApi.getLinkTree).toHaveBeenCalledTimes(2))
    expect(linkTreeApi.deleteItem).toHaveBeenLastCalledWith(1, 10)
  })

  it('menghapus link tree: batal, gagal, berhasil lalu kembali ke beranda', async () => {
    const u = userEvent.setup()
    render(DetailPage, { params })
    const button = await screen.findByRole('button', { name: 'Hapus Link Tree' })

    stubConfirm(false)
    await u.click(button)
    expect(linkTreeApi.deleteLinkTree).not.toHaveBeenCalled()

    stubConfirm(true)
    linkTreeApi.deleteLinkTree.mockRejectedValueOnce(new ApiError('Gagal hapus link tree'))
    await u.click(button)
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal hapus link tree')

    linkTreeApi.deleteLinkTree.mockResolvedValueOnce(ok(null, 'Berhasil menghapus data'))
    currentPath.set('/link-trees/1')
    await u.click(button)
    await waitFor(() => expect(get(currentPath)).toBe('/'))
    expect(linkTreeApi.deleteLinkTree).toHaveBeenLastCalledWith(1)
  })
})
