import { createRawSnippet } from 'svelte'
import { fireEvent, render, screen } from '@testing-library/svelte'
import Modal from './Modal.svelte'

const children = createRawSnippet(() => ({ render: () => '<p>Isi modal</p>' }))

describe('Modal', () => {
  it('menampilkan judul dan konten', () => {
    render(Modal, { title: 'Judul', onclose: vi.fn(), children })
    expect(screen.getByRole('dialog', { name: 'Judul' })).toBeInTheDocument()
    expect(screen.getByText('Isi modal')).toBeInTheDocument()
  })

  it('menutup lewat tombol tutup dan tombol Escape saja', async () => {
    const onclose = vi.fn()
    render(Modal, { title: 'Judul', onclose, children })
    await fireEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    expect(onclose).toHaveBeenCalledTimes(1)

    await fireEvent.keyDown(window, { key: 'Enter' })
    expect(onclose).toHaveBeenCalledTimes(1)

    await fireEvent.keyDown(window, { key: 'Escape' })
    expect(onclose).toHaveBeenCalledTimes(2)
  })
})
