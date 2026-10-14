import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import AddModal from './AddModal.svelte'
import * as linkTreeApi from '../api/linkTreeApi.js'
import { resetLinkTreesState } from '../states/linkTreesStore.js'
import { ApiError } from '../../../helpers/apiHelper.js'
import { ok } from '../../../test/fixtures.js'

vi.mock('../api/linkTreeApi.js')

async function fill(u) {
  await u.type(screen.getByLabelText('Judul'), 'Kursus Ku')
  await u.selectOptions(screen.getByLabelText('Tipe'), 'private')
  await u.type(screen.getByLabelText('Deskripsi'), 'Kumpulan kursus')
  await u.click(screen.getByRole('button', { name: 'Simpan' }))
}

describe('AddModal', () => {
  beforeEach(() => resetLinkTreesState())

  it('menyimpan link tree baru lalu menutup modal', async () => {
    linkTreeApi.createLinkTree.mockResolvedValue(ok({ link_tree_id: 5 }, 'Berhasil menambahkan data'))
    const onsaved = vi.fn()
    const onclose = vi.fn()
    const u = userEvent.setup()
    render(AddModal, { onsaved, onclose })
    await fill(u)
    await waitFor(() => expect(onsaved).toHaveBeenCalledTimes(1))
    expect(onclose).toHaveBeenCalledTimes(1)
    expect(linkTreeApi.createLinkTree).toHaveBeenCalledWith({
      title: 'Kursus Ku',
      type: 'private',
      description: 'Kumpulan kursus'
    })
  })

  it('menampilkan error dan tidak menutup modal saat gagal', async () => {
    linkTreeApi.createLinkTree.mockRejectedValue(new ApiError('Data tidak valid', { title: ['Wajib'] }))
    const onsaved = vi.fn()
    const onclose = vi.fn()
    const u = userEvent.setup()
    render(AddModal, { onsaved, onclose })
    await fill(u)
    expect(await screen.findByRole('alert')).toHaveTextContent('Data tidak valid: Wajib')
    expect(onsaved).not.toHaveBeenCalled()
    expect(onclose).not.toHaveBeenCalled()
  })

  it('tombol Batal menutup modal', async () => {
    const onclose = vi.fn()
    const u = userEvent.setup()
    render(AddModal, { onsaved: vi.fn(), onclose })
    await u.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onclose).toHaveBeenCalledTimes(1)
  })
})
