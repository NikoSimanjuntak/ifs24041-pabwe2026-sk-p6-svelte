import { ApiError, assetUrl, BASE_URL, request, setUnauthorizedHandler } from './apiHelper.js'
import { setAccessToken } from './toolsHelper.js'
import { fetchResponse } from '../test/fixtures.js'

const success = { status: 'success', message: 'Berhasil', data: { a: 1 } }

describe('apiHelper', () => {
  beforeEach(() => setUnauthorizedHandler(null))

  it('ApiError memiliki nilai bawaan', () => {
    const error = new ApiError('Gagal')
    expect(error.fields).toEqual({})
    expect(error.status).toBe(0)
    expect(error.name).toBe('ApiError')
  })

  it('melakukan GET tanpa token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(fetchResponse(success))
    vi.stubGlobal('fetch', fetchMock)
    await expect(request('/users')).resolves.toEqual(success)
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/users`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      body: undefined
    })
  })

  it('mengirim body JSON beserta token', async () => {
    setAccessToken('tok')
    const fetchMock = vi.fn().mockResolvedValue(fetchResponse(success))
    vi.stubGlobal('fetch', fetchMock)
    await request('/link-trees', { method: 'POST', body: { title: 'A' } })
    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers.Authorization).toBe('Bearer tok')
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.body).toBe(JSON.stringify({ title: 'A' }))
  })

  it('mengirim FormData tanpa Content-Type manual', async () => {
    const fetchMock = vi.fn().mockResolvedValue(fetchResponse(success))
    vi.stubGlobal('fetch', fetchMock)
    const form = new FormData()
    await request('/upload', { method: 'POST', form })
    const [, options] = fetchMock.mock.calls[0]
    expect(options.body).toBe(form)
    expect(options.headers['Content-Type']).toBeUndefined()
  })

  it('menambahkan query string', async () => {
    const fetchMock = vi.fn().mockResolvedValue(fetchResponse(success))
    vi.stubGlobal('fetch', fetchMock)
    await request('/link-trees', { query: { is_me: 1 } })
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/link-trees?is_me=1`)
  })

  it('melempar ApiError saat jaringan gagal', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    await expect(request('/x')).rejects.toThrow('Tidak dapat terhubung ke server')
  })

  it('menangani respons non-JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.reject(new Error('bad')) })
    )
    await expect(request('/x')).rejects.toMatchObject({
      message: 'Terjadi kesalahan pada server',
      status: 500,
      fields: {}
    })
  })

  it('membawa pesan dan field validasi dari server', async () => {
    const body = { status: 'fail', message: 'Data tidak valid', data: { field: { title: ['Wajib'] } } }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fetchResponse(body, { ok: false, status: 400 })))
    await expect(request('/x')).rejects.toMatchObject({
      message: 'Data tidak valid',
      fields: { title: ['Wajib'] },
      status: 400
    })
  })

  it('menolak respons HTTP 200 dengan status fail tanpa field', async () => {
    const body = { status: 'fail', message: 'Gagal', data: {} }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fetchResponse(body)))
    await expect(request('/x')).rejects.toMatchObject({ message: 'Gagal', fields: {} })
  })

  it('memanggil handler saat 401 jika terdaftar', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    const body = { status: 'fail', message: 'Unauthenticated.' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fetchResponse(body, { ok: false, status: 401 })))
    await expect(request('/x')).rejects.toThrow('Unauthenticated.')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('tetap melempar error pada 401 tanpa handler', async () => {
    const body = { status: 'fail', message: 'Unauthenticated.' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fetchResponse(body, { ok: false, status: 401 })))
    await expect(request('/x')).rejects.toThrow('Unauthenticated.')
  })

  it('membentuk URL aset', () => {
    expect(assetUrl('')).toBe('')
    expect(assetUrl(null)).toBe('')
    expect(assetUrl('https://cdn.test/a.png')).toBe('https://cdn.test/a.png')
    expect(assetUrl('img/profile/1.png')).toBe('https://open-api.delcom.org/img/profile/1.png')
    expect(assetUrl('/img/profile/1.png')).toBe('https://open-api.delcom.org/img/profile/1.png')
  })
})
