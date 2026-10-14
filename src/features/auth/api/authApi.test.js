import { request } from '../../../helpers/apiHelper.js'
import { login, logout, register } from './authApi.js'

vi.mock('../../../helpers/apiHelper.js', () => ({ request: vi.fn() }))

describe('authApi', () => {
  it('login', () => {
    login('a@b.co', 'rahasia')
    expect(request).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'a@b.co', password: 'rahasia' }
    })
  })

  it('register', () => {
    register('Nama', 'a@b.co', 'rahasia')
    expect(request).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: { name: 'Nama', email: 'a@b.co', password: 'rahasia' }
    })
  })

  it('logout', () => {
    logout()
    expect(request).toHaveBeenCalledWith('/auth/logout', { method: 'POST' })
  })
})
