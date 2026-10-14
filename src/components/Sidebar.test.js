import { get } from 'svelte/store'
import { fireEvent, render, screen } from '@testing-library/svelte'
import Sidebar from './Sidebar.svelte'
import { currentPath } from '../lib/navigation.js'

const current = (name) => screen.getByRole('link', { name })

describe('Sidebar', () => {
  it('menampilkan menu utama dan menandai beranda aktif', () => {
    currentPath.set('/')
    render(Sidebar, { open: true, onclose: vi.fn() })
    expect(current('Semua Link Tree')).toHaveAttribute('aria-current', 'page')
    expect(current('Pengguna')).not.toHaveAttribute('aria-current')
    expect(current('Profil')).not.toHaveAttribute('aria-current')
  })

  it('menu Semua Link Tree aktif pada halaman detail', () => {
    currentPath.set('/link-trees/5')
    render(Sidebar, { open: true, onclose: vi.fn() })
    expect(current('Semua Link Tree')).toHaveAttribute('aria-current', 'page')
  })

  it('menandai menu pengguna dan profil', () => {
    currentPath.set('/users')
    const { unmount } = render(Sidebar, { open: false, onclose: vi.fn() })
    expect(current('Pengguna')).toHaveAttribute('aria-current', 'page')
    unmount()
    currentPath.set('/profile')
    render(Sidebar, { open: false, onclose: vi.fn() })
    expect(current('Profil')).toHaveAttribute('aria-current', 'page')
  })

  it('mengatur kelas tampilan berdasarkan prop open', () => {
    currentPath.set('/')
    const { unmount } = render(Sidebar, { open: true, onclose: vi.fn() })
    expect(screen.getByLabelText('Menu utama')).toHaveClass('block')
    unmount()
    render(Sidebar, { onclose: vi.fn() })
    expect(screen.getByLabelText('Menu utama')).toHaveClass('hidden')
  })

  it('klik menu bernavigasi dan memanggil onclose', async () => {
    const onclose = vi.fn()
    render(Sidebar, { open: true, onclose })
    await fireEvent.click(current('Profil'))
    expect(get(currentPath)).toBe('/profile')
    expect(onclose).toHaveBeenCalledTimes(1)
  })
})
