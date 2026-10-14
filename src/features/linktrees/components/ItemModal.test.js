import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import ItemModal from './ItemModal.svelte'
import * as linkTreeApi from '../api/linkTreeApi.js'
import { resetLinkTreesState } from '../states/linkTreesStore.js'
import { ApiError } from '../../../helpers/apiHelper.js'
import { ok } from '../../../test/fixtures.js'

vi.mock('../api/linkTreeApi.js')

describe('ItemModal', () => {
  beforeEach(() => resetLinkTreesState())

  it('mode tambah: memvalidasi URL lalu menyimpan', async () => {
    linkTreeApi.addItem.mockResolvedValue(ok({ item_id: 1 }))
    const onsaved = vi.fn()
    const onclose = vi.fn()
    const u = userEvent.setup()
    render(ItemModal, { linkTreeId: 2, item: null, onsaved, onclose })
    expect(screen.getByRole('dialog', { name: 'Tambah Tautan' })).toBeInTheDocument()

    await u.type(screen.getByLabelText('Judul tautan'), 'Delcom')
    await u.type(screen.getByLabelText('URL'), 'bukan-url')
    await u.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('URL harus diawali http:// atau https://')
    expect(linkTreeApi.addItem).not.toHaveBeenCalled()

    await u.clear(screen.getByLabelText('URL'))
    await u.type(screen.getByLabelText('URL'), 'https://delcom.org')
    await u.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(onsaved).toHaveBeenCalledTimes(1))
    expect(onclose).toHaveBeenCalledTimes(1)
    expect(linkTreeApi.addItem).toHaveBeenCalledWith(2, { title: 'Delcom', url: 'https://delcom.org' })
    expect(screen.queryByText('URL harus diawali http:// atau https://')).not.toBeInTheDocument()
  })

  it('mode ubah: terisi data tautan dan memanggil update', async () => {
    linkTreeApi.updateItem.mockResolvedValue(ok(null))
    const onsaved = vi.fn()
    const u = userEvent.setup()
    render(ItemModal, {
      linkTreeId: 2,
      item: { id: 10, title: 'Dasar Java', url: 'https://youtu.be/abc' },
      onsaved,
      onclose: vi.fn()
    })
    expect(screen.getByRole('dialog', { name: 'Ubah Tautan' })).toBeInTheDocument()
    expect(screen.getByLabelText('Judul tautan')).toHaveValue('Dasar Java')
    expect(screen.getByLabelText('URL')).toHaveValue('https://youtu.be/abc')

    await u.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(onsaved).toHaveBeenCalledTimes(1))
    expect(linkTreeApi.updateItem).toHaveBeenCalledWith(2, 10, {
      title: 'Dasar Java',
      url: 'https://youtu.be/abc'
    })
  })

  it('menampilkan error server dan Batal menutup modal', async () => {
    linkTreeApi.addItem.mockRejectedValue(new ApiError('Tautan ditolak'))
    const onsaved = vi.fn()
    const onclose = vi.fn()
    const u = userEvent.setup()
    render(ItemModal, { linkTreeId: 2, item: null, onsaved, onclose })
    await u.type(screen.getByLabelText('Judul tautan'), 'Delcom')
    await u.type(screen.getByLabelText('URL'), 'https://delcom.org')
    await u.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Tautan ditolak')
    expect(onsaved).not.toHaveBeenCalled()

    await u.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onclose).toHaveBeenCalledTimes(1)
  })
})
