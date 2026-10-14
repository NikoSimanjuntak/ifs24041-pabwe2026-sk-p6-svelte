import { screen } from '@testing-library/svelte'

describe('main', () => {
  it('memasang aplikasi pada elemen #app', async () => {
    document.body.innerHTML = '<div id="app"></div>'
    const module = await import('./main.js')
    expect(module.default).toBeDefined()
    expect(await screen.findByRole('heading', { name: 'Masuk' })).toBeInTheDocument()
  })
})
