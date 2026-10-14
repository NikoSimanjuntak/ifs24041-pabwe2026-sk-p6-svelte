import { writable } from 'svelte/store'

export const currentPath = writable(window.location.pathname)

export function navigate(path, replace = false) {
  window.history[replace ? 'replaceState' : 'pushState'](null, '', path)
  currentPath.set(path)
}

export function syncPath() {
  currentPath.set(window.location.pathname)
}

export function initRouter() {
  window.addEventListener('popstate', syncPath)
  return () => window.removeEventListener('popstate', syncPath)
}

/** Svelte action: ubah klik pada <a href> menjadi navigasi SPA. */
export function link(node) {
  const handleClick = (event) => {
    event.preventDefault()
    navigate(node.getAttribute('href'))
  }
  node.addEventListener('click', handleClick)
  return {
    destroy() {
      node.removeEventListener('click', handleClick)
    }
  }
}
