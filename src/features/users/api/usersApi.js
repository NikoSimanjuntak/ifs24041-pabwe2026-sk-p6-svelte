import { request } from '../../../helpers/apiHelper.js'

export const getUsers = () => request('/users')

export const getProfile = () => request('/users/me')

export const updateProfile = ({ name, email }) => request('/users/me', { method: 'PUT', body: { name, email } })

export function updatePhoto(file) {
  const form = new FormData()
  form.append('photo', file)
  return request('/users/me/photo', { method: 'POST', form })
}

export const updatePassword = ({ password, new_password, new_password_confirmation }) =>
  request('/users/password', {
    method: 'PUT',
    body: { password, new_password, new_password_confirmation }
  })
