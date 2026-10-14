import { ApiError } from './apiHelper.js'
import {
  describeError,
  formatDate,
  getAccessToken,
  getInitials,
  hasCover,
  isValidHttpUrl,
  removeAccessToken,
  setAccessToken,
  typeLabel
} from './toolsHelper.js'

describe('toolsHelper', () => {
  it('menyimpan, membaca, dan menghapus token', () => {
    expect(getAccessToken()).toBeNull()
    setAccessToken('abc')
    expect(getAccessToken()).toBe('abc')
    removeAccessToken()
    expect(getAccessToken()).toBeNull()
  })

  it('memformat tanggal valid dan tidak valid', () => {
    expect(formatDate('2025-03-09T01:32:33.000000Z')).toContain('2025')
    expect(formatDate('bukan-tanggal')).toBe('-')
  })

  it('mengambil inisial nama', () => {
    expect(getInitials('Abdullah Ubaid Tambunan')).toBe('AU')
    expect(getInitials('')).toBe('')
  })

  it('memberi label tipe link tree', () => {
    expect(typeLabel('public')).toBe('Publik')
    expect(typeLabel('unlisted')).toBe('Tidak Terdaftar')
    expect(typeLabel('lainnya')).toBe('lainnya')
  })

  it('mendeteksi cover yang tersedia', () => {
    expect(hasCover(null)).toBe(false)
    expect(hasCover('http://localhost:8000/')).toBe(false)
    expect(hasCover('http://localhost:8000/img/cover.png')).toBe(true)
  })

  it('memvalidasi URL http(s)', () => {
    expect(isValidHttpUrl('https://delcom.org')).toBe(true)
    expect(isValidHttpUrl('ftp://delcom.org')).toBe(false)
    expect(isValidHttpUrl('bukan url')).toBe(false)
  })

  it('menjelaskan error dengan dan tanpa detail', () => {
    expect(describeError(new ApiError('Data tidak valid', { title: ['Wajib diisi'], url: ['Tidak valid'] }))).toBe(
      'Data tidak valid: Wajib diisi, Tidak valid'
    )
    expect(describeError(new ApiError('Gagal'))).toBe('Gagal')
    expect(describeError(new Error('Biasa'))).toBe('Biasa')
  })
})
