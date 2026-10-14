import { get } from 'svelte/store'
import * as usersApi from '../api/usersApi.js'
import {
  fetchProfile,
  fetchUsers,
  resetUsersFeedback,
  resetUsersState,
  savePassword,
  savePhoto,
  saveProfile,
  usersState
} from './usersStore.js'
import { authUser, clearSession } from '../../auth/states/authStore.js'
import { ApiError } from '../../../helpers/apiHelper.js'
import { ok, user } from '../../../test/fixtures.js'

vi.mock('../api/usersApi.js')

describe('usersStore', () => {
  beforeEach(() => {
    resetUsersState()
    clearSession()
  })

  it('fetchUsers berhasil dan gagal', async () => {
    usersApi.getUsers.mockResolvedValueOnce(ok({ users: [user] }))
    await expect(fetchUsers()).resolves.toBe(true)
    expect(get(usersState).users).toEqual([user])

    usersApi.getUsers.mockRejectedValueOnce(new ApiError('Gagal memuat'))
    await expect(fetchUsers()).resolves.toBe(false)
    expect(get(usersState).error).toBe('Gagal memuat')
    expect(get(usersState).loading).toBe(false)
  })

  it('fetchProfile berhasil menyelaraskan authUser dan gagal', async () => {
    usersApi.getProfile.mockResolvedValueOnce(ok({ user }))
    await expect(fetchProfile()).resolves.toBe(true)
    expect(get(usersState).profile).toEqual(user)
    expect(get(authUser)).toEqual(user)

    usersApi.getProfile.mockRejectedValueOnce(new ApiError('Gagal profil'))
    await expect(fetchProfile()).resolves.toBe(false)
    expect(get(usersState).error).toBe('Gagal profil')
  })

  it('saveProfile berhasil dan gagal', async () => {
    const updated = { ...user, name: 'Nama Baru' }
    usersApi.updateProfile.mockResolvedValueOnce(ok({ user: updated }, 'Berhasil mengubah data'))
    await expect(saveProfile({ name: 'Nama Baru', email: user.email })).resolves.toBe(true)
    expect(get(usersState).profile).toEqual(updated)
    expect(get(authUser)).toEqual(updated)
    expect(get(usersState).message).toBe('Berhasil mengubah data')

    usersApi.updateProfile.mockRejectedValueOnce(new ApiError('Data tidak valid'))
    await expect(saveProfile({ name: '', email: '' })).resolves.toBe(false)
    expect(get(usersState).error).toBe('Data tidak valid')
    expect(get(usersState).mutating).toBe(false)
  })

  it('savePhoto memuat ulang profil saat berhasil', async () => {
    usersApi.updatePhoto.mockResolvedValueOnce(ok(null, 'Berhasil mengubah foto'))
    usersApi.getProfile.mockResolvedValueOnce(ok({ user }))
    await expect(savePhoto(new File(['x'], 'a.png'))).resolves.toBe(true)
    expect(usersApi.getProfile).toHaveBeenCalledTimes(1)
    expect(get(usersState).message).toBe('Berhasil mengubah foto')

    usersApi.updatePhoto.mockRejectedValueOnce(new ApiError('Foto ditolak'))
    await expect(savePhoto(new File(['x'], 'a.png'))).resolves.toBe(false)
    expect(usersApi.getProfile).toHaveBeenCalledTimes(1)
    expect(get(usersState).error).toBe('Foto ditolak')
  })

  it('savePassword berhasil dan gagal', async () => {
    usersApi.updatePassword.mockResolvedValueOnce(ok(null, 'Berhasil mengubah kata sandi'))
    await expect(savePassword({ password: 'a', new_password: 'b', new_password_confirmation: 'b' })).resolves.toBe(true)
    expect(get(usersState).message).toBe('Berhasil mengubah kata sandi')

    usersApi.updatePassword.mockRejectedValueOnce(new ApiError('Kata sandi salah'))
    await expect(savePassword({ password: 'x', new_password: 'b', new_password_confirmation: 'b' })).resolves.toBe(false)
    expect(get(usersState).error).toBe('Kata sandi salah')
  })

  it('reset state dan feedback', () => {
    usersState.update((state) => ({ ...state, error: 'e', message: 'm', users: [user] }))
    resetUsersFeedback()
    expect(get(usersState)).toMatchObject({ error: null, message: null, users: [user] })
    resetUsersState()
    expect(get(usersState).users).toEqual([])
  })
})
