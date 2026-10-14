import { request } from '../../../helpers/apiHelper.js'
import {
  addItem,
  changeCover,
  createLinkTree,
  deleteAllLinkTrees,
  deleteItem,
  deleteLinkTree,
  getLinkTree,
  getLinkTrees,
  updateItem,
  updateLinkTree
} from './linkTreeApi.js'

vi.mock('../../../helpers/apiHelper.js', () => ({ request: vi.fn() }))

const payload = { title: 'Judul', type: 'public', description: 'Deskripsi' }

describe('linkTreeApi', () => {
  it('createLinkTree', () => {
    createLinkTree({ ...payload, extra: 'diabaikan' })
    expect(request).toHaveBeenCalledWith('/link-trees', { method: 'POST', body: payload })
  })

  it('changeCover mengirim FormData berkas cover', () => {
    const file = new File(['x'], 'cover.png', { type: 'image/png' })
    changeCover(3, file)
    const [path, options] = request.mock.calls[0]
    expect(path).toBe('/link-trees/3/cover')
    expect(options.method).toBe('POST')
    expect(options.form.get('cover')).toBe(file)
  })

  it('updateLinkTree', () => {
    updateLinkTree(3, payload)
    expect(request).toHaveBeenCalledWith('/link-trees/3', { method: 'PUT', body: payload })
  })

  it('getLinkTrees dengan dan tanpa filter milik saya', () => {
    getLinkTrees()
    expect(request).toHaveBeenLastCalledWith('/link-trees', {})
    getLinkTrees(true)
    expect(request).toHaveBeenLastCalledWith('/link-trees', { query: { is_me: 1 } })
  })

  it('getLinkTree dan deleteLinkTree', () => {
    getLinkTree(3)
    expect(request).toHaveBeenLastCalledWith('/link-trees/3')
    deleteLinkTree(3)
    expect(request).toHaveBeenLastCalledWith('/link-trees/3', { method: 'DELETE' })
  })

  it('deleteAllLinkTrees', () => {
    deleteAllLinkTrees()
    expect(request).toHaveBeenCalledWith('/link-trees', { method: 'DELETE' })
  })

  it('operasi item', () => {
    const item = { title: 'Judul', url: 'https://delcom.org' }
    addItem(3, { ...item, extra: 1 })
    expect(request).toHaveBeenLastCalledWith('/link-trees/3/items', { method: 'POST', body: item })
    updateItem(3, 7, item)
    expect(request).toHaveBeenLastCalledWith('/link-trees/3/items/7', { method: 'PUT', body: item })
    deleteItem(3, 7)
    expect(request).toHaveBeenLastCalledWith('/link-trees/3/items/7', { method: 'DELETE' })
  })
})
