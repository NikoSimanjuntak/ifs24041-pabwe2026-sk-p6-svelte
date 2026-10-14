import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import ChangeCoverModal from './ChangeCoverModal.svelte'
import * as linkTreeApi from '../api/linkTreeApi.js'
import { resetLinkTreesState } from '../states/linkTreesStore.js'
import { ApiError } from '../../../helpers/apiHelper.js'
import { ok } from '../../../test/fixtures.js'

vi.mock('../api/linkTreeApi.js')

const png = () => new File(['x'], 'cover.png', { type: 'image/png' })

describe('ChangeCoverModal', () => {
  beforeEach(() => resetLinkTreesState())

  it('meminta berkas jika belum dipilih', async () => {
    const onclose = vi.fn()
    const u = userEvent.setup()
    render(ChangeCoverModal, { linkTreeId: 1, onsaved: vi.fn(), onclose })
    await u.click(screen.getByRole('button', { name: 'Unggah' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Pilih berkas gambar terlebih dahulu.')
    expect(linkTreeApi.changeCover).not.toHaveBeenCalled()
    expect(onclose).not.toHaveBeenCalled()
  })

  it('mengunggah cover lalu menutup modal', async () => {
    linkTreeApi.changeCover.mockResolvedValue(ok(null, 'Berhasil mengubah cover'))
    const onsaved = vi.fn()
    const onclose = vi.fn()
    const file = png()
    const u = userEvent.setup()
    render(ChangeCoverModal, { linkTreeId: 4, onsaved, onclose })
    await u.upload(screen.getByLabelText('Berkas sampul'), file)
    await u.click(screen.getByRole('button', { name: 'Unggah' }))
    await waitFor(() => expect(onsaved).toHaveBeenCalledTimes(1))
    expect(onclose).toHaveBeenCalledTimes(1)
    expect(linkTreeApi.changeCover).toHaveBeenCalledWith(4, file)
  })

  it('menampilkan error server, menghapus error lokal, dan Batal menutup', async () => {
    linkTreeApi.changeCover.mockRejectedValue(new ApiError('Berkas ditolak'))
    const onclose = vi.fn()
    const u = userEvent.setup()
    render(ChangeCoverModal, { linkTreeId: 4, onsaved: vi.fn(), onclose })

    await u.click(screen.getByRole('button', { name: 'Unggah' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Pilih berkas gambar')

    await u.upload(screen.getByLabelText('Berkas sampul'), png())
    await u.click(screen.getByRole('button', { name: 'Unggah' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Berkas ditolak'))
    expect(screen.queryByText('Pilih berkas gambar terlebih dahulu.')).not.toBeInTheDocument()

    await u.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onclose).toHaveBeenCalledTimes(1)
  })

  it('pilihan berkas dikosongkan kembali menjadi tidak ada berkas', async () => {
    const u = userEvent.setup()
    render(ChangeCoverModal, { linkTreeId: 4, onsaved: vi.fn(), onclose: vi.fn() })
    await fireEvent.change(screen.getByLabelText('Berkas sampul'), { target: { files: [] } })
    await u.click(screen.getByRole('button', { name: 'Unggah' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Pilih berkas gambar')
  })
})
