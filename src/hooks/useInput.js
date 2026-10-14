import { writable } from 'svelte/store'

/**
 * Custom hook untuk mengelola nilai input form.
 * Mengembalikan objek yang kompatibel dengan store Svelte
 * sehingga dapat dipakai dengan `$value` dan `bind:value={$value}`.
 */
export function useInput(initialValue = '') {
  const { subscribe, set } = writable(initialValue)

  return {
    subscribe,
    set,
    onInput: (event) => set(event.target.value),
    reset: () => set(initialValue)
  }
}
