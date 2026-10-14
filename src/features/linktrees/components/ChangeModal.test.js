import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import ChangeModal from './ChangeModal.svelte'
import * as linkTreeApi from '../api/linkTreeApi.js'
import { resetLinkTreesState } from '../states/linkTreesStore.js'
import { ApiError } from '../../../helpers/apiHelper.js'
import { makeLinkTree, ok } from '../../../test/fixtures.js'

vi.mock('../api/linkTreeApi.js')

describe('ChangeModal', () => {
  beforeEach(() => resetLinkTreesState())

  it('terisi data awal dan menyimpan perubahan', async () => {
    linkTreeApi.updateLinkTree.mockResolvedValue(ok(null, 'Berhasil mengubah data'))
    const onsaved = vi.fn()
    const onclose = vi.fn()
    const u = userEvent.setup()
    render(ChangeModal, { linkTree: makeLinkTree(), onsaved, onclose })
    expect(screen.getByLabelText('Judul')).toHaveValue('Kursus Ku')
    expect(screen.getByLabelText('Tipe')).toHaveValue('public')
    expect(screen.getByLabelText('Deskripsi')).toHaveValue('Kumpulan kursus favorit')

    await u.clear(screen.getByLabelText('Judul'))
    await u.type(screen.getByLabelText('Judul'), 'Judul Baru')
    await u.selectOptions(screen.getByLabelText('Tipe'), 'unlisted')
    await u.click(screen.getByRole('button', { name: 'Simpan perubahan' }))

    await waitFor(() => expect(onsaved).toHaveBeenCalledTimes(1))
    expect(onclose).toHaveBeenCalledTimes(1)
    expect(linkTreeApi.updateLinkTree).toHaveBeenCalledWith(1, {
      title: 'Judul Baru',
      type: 'unlisted',
      description: 'Kumpulan kursus favorit'
    })
  })

  it('menampilkan error saat gagal dan Batal menutup modal', async () => {
    linkTreeApi.updateLinkTree.mockRejectedValue(new ApiError('Gagal mengubah'))
    const onsaved = vi.fn()
    const onclose = vi.fn()
    const u = userEvent.setup()
    render(ChangeModal, { linkTree: makeLinkTree(), onsaved, onclose })
    await u.click(screen.getByRole('button', { name: 'Simpan perubahan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal mengubah')
    expect(onsaved).not.toHaveBeenCalled()

    await u.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onclose).toHaveBeenCalledTimes(1)
  })
})
