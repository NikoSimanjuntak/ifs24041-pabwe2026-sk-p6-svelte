import { get } from 'svelte/store'
import { useInput } from './useInput.js'

describe('useInput', () => {
  it('memakai nilai awal bawaan string kosong', () => {
    expect(get(useInput())).toBe('')
  })

  it('mengubah dan mereset nilai', () => {
    const input = useInput('awal')
    expect(get(input)).toBe('awal')
    input.onInput({ target: { value: 'baru' } })
    expect(get(input)).toBe('baru')
    input.set('lain')
    expect(get(input)).toBe('lain')
    input.reset()
    expect(get(input)).toBe('awal')
  })
})
