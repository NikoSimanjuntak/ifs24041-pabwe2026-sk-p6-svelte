import { get } from 'svelte/store'
import { fireEvent, render, screen } from '@testing-library/svelte'
import NotFoundPage from './NotFoundPage.svelte'
import { currentPath } from '../lib/navigation.js'

describe('NotFoundPage', () => {
  it('menampilkan pesan dan tautan kembali', async () => {
    render(NotFoundPage)
    expect(screen.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('link', { name: 'Kembali ke beranda' }))
    expect(get(currentPath)).toBe('/')
  })
})
