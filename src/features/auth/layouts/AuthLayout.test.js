import { createRawSnippet } from 'svelte'
import { render, screen } from '@testing-library/svelte'
import AuthLayout from './AuthLayout.svelte'

describe('AuthLayout', () => {
  it('menampilkan logo, teks pengenal, dan konten', () => {
    const children = createRawSnippet(() => ({ render: () => '<p>Isi halaman</p>' }))
    render(AuthLayout, { children })
    expect(screen.getByRole('heading', { name: 'Delcom Link Tree' })).toBeInTheDocument()
    expect(screen.getByText(/Kumpulkan semua tautan pentingmu/)).toBeInTheDocument()
    expect(screen.getByLabelText('Logo Delcom Link Tree')).toBeInTheDocument()
    expect(screen.getByText('Isi halaman')).toBeInTheDocument()
  })
})
