import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import ProfilePage from './ProfilePage.svelte'
import * as usersApi from '../api/usersApi.js'
import { resetUsersState } from '../states/usersStore.js'
import { ApiError } from '../../../helpers/apiHelper.js'
import { ok, user } from '../../../test/fixtures.js'

vi.mock('../api/usersApi.js')

const getForm = (name) => screen.getByRole('form', { name })

describe('ProfilePage', () => {
  beforeEach(() => {
    resetUsersState()
    usersApi.getProfile.mockResolvedValue(ok({ user }))
  })

  it('mengisi form dengan data profil dan menampilkan foto', async () => {
    render(ProfilePage)
    await waitFor(() => expect(screen.getByLabelText('Nama')).toHaveValue('Abdullah Ubaid'))
    expect(screen.getByLabelText('Email')).toHaveValue('ubaid@delcom.org')
    expect(screen.getByAltText('Foto profil')).toBeInTheDocument()
  })

  it('menampilkan inisial jika tidak ada foto', async () => {
    usersApi.getProfile.mockResolvedValue(ok({ user: { ...user, photo: '' } }))
    render(ProfilePage)
    expect(await screen.findByText('AU')).toBeInTheDocument()
  })

  it('tetap tampil saat profil gagal dimuat', async () => {
    usersApi.getProfile.mockRejectedValue(new ApiError('Gagal memuat profil'))
    render(ProfilePage)
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal memuat profil')
    expect(screen.getByLabelText('Nama')).toHaveValue('')
  })

  it('menyimpan perubahan profil', async () => {
    usersApi.updateProfile.mockResolvedValue(ok({ user: { ...user, name: 'Nama Baru' } }, 'Berhasil mengubah data'))
    const u = userEvent.setup()
    render(ProfilePage)
    await waitFor(() => expect(screen.getByLabelText('Nama')).toHaveValue('Abdullah Ubaid'))
    await u.clear(screen.getByLabelText('Nama'))
    await u.type(screen.getByLabelText('Nama'), 'Nama Baru')
    await u.click(screen.getByRole('button', { name: 'Simpan profil' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Berhasil mengubah data')
    expect(usersApi.updateProfile).toHaveBeenCalledWith({ name: 'Nama Baru', email: 'ubaid@delcom.org' })
  })

  it('mengunggah foto lalu mereset pilihan berkas', async () => {
    usersApi.updatePhoto.mockResolvedValue(ok(null, 'Berhasil mengubah foto'))
    const u = userEvent.setup()
    render(ProfilePage)
    await screen.findByAltText('Foto profil')
    const button = screen.getByRole('button', { name: 'Unggah foto' })
    expect(button).toBeDisabled()

    await u.upload(screen.getByLabelText('Berkas foto'), new File(['x'], 'foto.png', { type: 'image/png' }))
    expect(button).toBeEnabled()
    await u.click(button)
    expect(await screen.findByText('Berhasil mengubah foto')).toBeInTheDocument()
    expect(usersApi.updatePhoto).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(button).toBeDisabled())
  })

  it('mempertahankan berkas saat unggah gagal', async () => {
    usersApi.updatePhoto.mockRejectedValue(new ApiError('Foto ditolak'))
    const u = userEvent.setup()
    render(ProfilePage)
    await screen.findByAltText('Foto profil')
    await u.upload(screen.getByLabelText('Berkas foto'), new File(['x'], 'foto.png', { type: 'image/png' }))
    await u.click(screen.getByRole('button', { name: 'Unggah foto' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Foto ditolak')
    expect(screen.getByRole('button', { name: 'Unggah foto' })).toBeEnabled()
  })

  it('mengabaikan submit foto tanpa berkas dan pilihan berkas kosong', async () => {
    render(ProfilePage)
    await screen.findByAltText('Foto profil')
    const input = screen.getByLabelText('Berkas foto')
    await fireEvent.change(input, { target: { files: [] } })
    await fireEvent.submit(getForm('Ubah foto'))
    expect(usersApi.updatePhoto).not.toHaveBeenCalled()
  })

  it('mengubah kata sandi dan mengosongkan isian jika berhasil', async () => {
    usersApi.updatePassword.mockResolvedValue(ok(null, 'Berhasil mengubah kata sandi'))
    const u = userEvent.setup()
    render(ProfilePage)
    await screen.findByAltText('Foto profil')
    await u.type(screen.getByLabelText('Kata sandi saat ini'), 'lama123')
    await u.type(screen.getByLabelText('Kata sandi baru'), 'baru456')
    await u.type(screen.getByLabelText('Konfirmasi kata sandi baru'), 'baru456')
    await u.click(screen.getByRole('button', { name: 'Simpan kata sandi' }))
    expect(await screen.findByText('Berhasil mengubah kata sandi')).toBeInTheDocument()
    expect(usersApi.updatePassword).toHaveBeenCalledWith({
      password: 'lama123',
      new_password: 'baru456',
      new_password_confirmation: 'baru456'
    })
    expect(screen.getByLabelText('Kata sandi saat ini')).toHaveValue('')
  })

  it('mempertahankan isian kata sandi saat gagal', async () => {
    usersApi.updatePassword.mockRejectedValue(new ApiError('Kata sandi salah'))
    const u = userEvent.setup()
    render(ProfilePage)
    await screen.findByAltText('Foto profil')
    await u.type(screen.getByLabelText('Kata sandi saat ini'), 'salah')
    await u.type(screen.getByLabelText('Kata sandi baru'), 'baru456')
    await u.type(screen.getByLabelText('Konfirmasi kata sandi baru'), 'baru456')
    await u.click(screen.getByRole('button', { name: 'Simpan kata sandi' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Kata sandi salah')
    expect(screen.getByLabelText('Kata sandi saat ini')).toHaveValue('salah')
  })
})
