import { render, screen } from '@testing-library/svelte'
import LogoIcon from './LogoIcon.svelte'

describe('LogoIcon', () => {
  it('memakai ukuran bawaan dan ukuran kustom', () => {
    const { unmount } = render(LogoIcon)
    expect(screen.getByLabelText('Logo Delcom Link Tree')).toHaveAttribute('width', '32')
    unmount()
    render(LogoIcon, { size: 64 })
    expect(screen.getByLabelText('Logo Delcom Link Tree')).toHaveAttribute('width', '64')
  })
})
