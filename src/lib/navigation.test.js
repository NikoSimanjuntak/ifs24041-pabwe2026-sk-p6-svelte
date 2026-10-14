import { get } from 'svelte/store'
import { currentPath, initRouter, link, navigate, syncPath } from './navigation.js'

describe('navigation', () => {
  it('navigate memakai pushState', () => {
    navigate('/users')
    expect(window.location.pathname).toBe('/users')
    expect(get(currentPath)).toBe('/users')
  })

  it('navigate dapat memakai replaceState', () => {
    const spy = vi.spyOn(window.history, 'replaceState')
    navigate('/profile', true)
    expect(spy).toHaveBeenCalledWith(null, '', '/profile')
    expect(get(currentPath)).toBe('/profile')
    spy.mockRestore()
  })

  it('syncPath dan initRouter mengikuti popstate', () => {
    const cleanup = initRouter()
    window.history.pushState(null, '', '/dari-browser')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(get(currentPath)).toBe('/dari-browser')

    cleanup()
    window.history.pushState(null, '', '/diabaikan')
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(get(currentPath)).toBe('/dari-browser')

    syncPath()
    expect(get(currentPath)).toBe('/diabaikan')
  })

  it('action link mengubah klik menjadi navigasi SPA', () => {
    const anchor = document.createElement('a')
    anchor.setAttribute('href', '/link-trees/9')
    const action = link(anchor)

    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    anchor.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(get(currentPath)).toBe('/link-trees/9')

    action.destroy()
    navigate('/')
    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(get(currentPath)).toBe('/')
  })
})
