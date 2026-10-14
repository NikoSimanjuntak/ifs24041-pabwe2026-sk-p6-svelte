import { request } from '../../../helpers/apiHelper.js'
import { getProfile, getUsers, updatePassword, updatePhoto, updateProfile } from './usersApi.js'

vi.mock('../../../helpers/apiHelper.js', () => ({ request: vi.fn() }))

describe('usersApi', () => {
  it('getUsers dan getProfile', () => {
    getUsers()
    expect(request).toHaveBeenCalledWith('/users')
    getProfile()
    expect(request).toHaveBeenCalledWith('/users/me')
  })

  it('updateProfile', () => {
    updateProfile({ name: 'N', email: 'a@b.co', extra: 'diabaikan' })
    expect(request).toHaveBeenCalledWith('/users/me', { method: 'PUT', body: { name: 'N', email: 'a@b.co' } })
  })

  it('updatePhoto mengirim FormData berkas photo', () => {
    const file = new File(['x'], 'foto.png', { type: 'image/png' })
    updatePhoto(file)
    const [path, options] = request.mock.calls[0]
    expect(path).toBe('/users/me/photo')
    expect(options.method).toBe('POST')
    expect(options.form.get('photo')).toBe(file)
  })

  it('updatePassword', () => {
    updatePassword({ password: 'a', new_password: 'b', new_password_confirmation: 'b' })
    expect(request).toHaveBeenCalledWith('/users/password', {
      method: 'PUT',
      body: { password: 'a', new_password: 'b', new_password_confirmation: 'b' }
    })
  })
})
